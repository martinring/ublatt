{-# LANGUAGE OverloadedStrings #-}
module Main where

import Prelude hiding (putStrLn,unwords,getContents,readFile)
import Model
import System.Environment (getArgs)
import Data.Yaml (decodeEither)
import qualified Text.Blaze.Html5 as H
import Text.Blaze.Html5 (
         (!),
         toHtml,
         textValue,
         stringValue,
         toValue
       )
import qualified Text.Blaze.Html5.Attributes as A
import Text.Blaze(dataAttribute)
import Text.Blaze.Html.Renderer.Utf8 (renderHtml)
import Data.ByteString (readFile,writeFile,getContents)
import Data.ByteString.Lazy.Char8 (putStrLn)
import Control.Monad (forM_,zipWithM_)
import Data.Monoid (mempty)
import Data.Text (Text,append,unwords,pack)
import Data.Char (toLower)
import Data.Maybe (fromMaybe, maybeToList)
import Text.Pandoc.Readers.Markdown
import Text.Pandoc.Writers.HTML
import Text.Pandoc.Options
import Text.Pandoc
import Text.Pandoc.Walk
import System.Process
import qualified System.IO as IO
import System.IO.Unsafe (unsafePerformIO)
import Debug.Trace (traceShowId)
import qualified Data.Map as Map
import Options.Applicative as O
import Data.Semigroup ((<>))


makeOptionalTitle :: Maybe Text -> H.Html
makeOptionalTitle title =
  forM_ title $ \title -> H.span ! A.class_ "title" $ H.toHtml title

exerciseName :: Int -> Maybe Int -> Maybe Int -> H.AttributeValue
exerciseName e i s =
  H.stringValue $ 'a' : show e ++ maybe "" show i ++ maybe "" show s

markdownOptions :: ReaderOptions
markdownOptions =
  def { readerExtensions = pandocExtensions, readerStandalone = False }

processMath :: Inline -> Inline
processMath (Text.Pandoc.Math tpe src) = Span
  attr
  [RawInline (Format "html") html]
 where
  classes = case tpe of
    InlineMath  -> ["math", "inline"]
    DisplayMath -> ["math", "display"]
  attr = ("", classes, [])
  html = unsafePerformIO $ do
    let p = shell "katex"
    readCreateProcess p src
processMath other = other


renderMarkdown :: Text -> H.Html
renderMarkdown txt = either renderError id result
 where
  result :: Either PandocError H.Html
  result = runPure $ do
    pdoc <- readMarkdown markdownOptions txt
    writeHtml5 def (walk processMath pdoc)
  renderError :: PandocError -> H.Html
  renderError error = H.p ! A.class_ "error" $ toHtml (show error)

makeExercisePart :: Int -> Maybe Int -> ExercisePart -> H.Html
makeExercisePart e i (Model.Markdown src            ) = renderMarkdown src
makeExercisePart e i (Model.Image source float align) = do
  let cls = unwords
        $  map (append "float-") (maybeToList float)
        ++ map (append "align-") (maybeToList align)
        ++ ["image"]
  H.div ! A.class_ (textValue cls) $ H.img ! A.src (textValue source)
makeExercisePart e i (Input t l) = H.div ! A.class_ (textValue cls) ! lattr $ mempty
  where lattr = dataAttribute "language" $ maybe mempty textValue l
        cls = unwords ["epart","input", pack $ map toLower $ show t]
makeExercisePart e i (Choice single compact choices) = do
  let isSingle = fromMaybe False single
  let isCompact = fromMaybe False compact
  let classNames = textValue $ unwords $ 
        "epart" : 
        (if isSingle then "single" else "multiple") :
        "choice" : 
        map (const "compact") (filter id (maybeToList compact))  
  H.ul ! A.class_ classNames $ forM_ (zip choices [1 ..]) $ \(choice, ci) ->
    H.li $ do
      let id = (exerciseName e i $ Just ci)
      let name = if isSingle then exerciseName e i Nothing else id
      let tpe = if isSingle then "radio" else "checkbox"
      H.input 
        ! A.type_ tpe
        ! A.name name
        ! A.id id
        ! A.value (textValue choice)      
      H.label ! A.for id $ 
        H.div ! A.class_ "description" $ renderMarkdown choice
makeExercisePart e i (ChoiceTable single choices rows) =
  H.div ! A.class_ "epart choice-table" $ do
    let tpe = if fromMaybe False single then "radio" else "checkbox"
    H.table $ do
      H.thead $ H.tr $ do
        H.th mempty
        forM_ choices (H.th . renderMarkdown)
      H.tbody $ forM_ (zip rows [1 ..]) $ \(row, rowi) -> H.tr $ do
        H.td ! A.class_ "choicetable_rh" $ renderMarkdown row
        forM_ choices $ \c ->
          H.td
            $ H.input
            ! A.type_ tpe
            ! A.name (exerciseName e i (Just rowi))
            ! A.value (textValue c)
makeExercisePart e i (Combine left right) = 
  H.div ! A.class_ "epart combine" $ do
    H.div ! A.class_ "rights" $ 
      forM_ right $ (H.div ! A.class_ "right" ! A.draggable "true") . renderMarkdown    
    H.div ! A.class_ "lefts" $ 
      forM_ left $ \content -> do
        H.div ! A.class_ "left" $ renderMarkdown content
        H.div ! A.class_ "placeholder" $ mempty

isQPart :: ExercisePart -> Bool
isQPart Model.Markdown{} = False
isQPart Model.Image{}    = False
isQPart _                = True

makeExercise :: Int -> Int -> Exercise -> H.Html
makeExercise s n (Exercise title content) = do
  let (qPartIndices, qParts) =
        unzip $ filter (isQPart . snd) $ zip [1 ..] content
  let renderedQParts = if length qParts == 1
        then map (makeExercisePart n Nothing) qParts
        else zipWith (\ex i -> makeExercisePart n (Just i) ex) qParts [1 ..]
  let qPartMap = Map.fromList $ zip qPartIndices renderedQParts
  H.h2 $ do
    H.span ! A.class_ "exercisenum" $ do
      H.span ! A.class_ "exercisenum_sheet" $ toHtml s
      H.span ! A.class_ "exercisenum_exercise" $ toHtml n
    makeOptionalTitle title
  let renderIndexedExercisePart i e =
        fromMaybe (makeExercisePart 0 Nothing e) $ Map.lookup i qPartMap
  H.toHtml $ zipWith renderIndexedExercisePart [1 ..] content

makeSheet (Sheet (CourseInfo title shortTitle term lecturers) 
                 (SheetInfo sheetTitle sheet issued due) 
                 header 
                 exercises 
                 footer) = do
  H.div ! A.class_ "head" $ do
    H.span ! A.class_ "title" $ toHtml title
    H.span ! A.class_ "term" $ toHtml term
    H.ul ! A.class_ "lecturers" $ forM_ lecturers $ H.li . toHtml
    H.span ! A.class_ "sheetnum" $ toHtml sheet    
    forM_ issued $ (H.span ! A.class_ "issued") . toHtml
    forM_ due $ (H.span ! A.class_ "due") . toHtml
    makeOptionalTitle sheetTitle
  H.div ! A.class_ "main" $ do
    H.toHtml $ map renderMarkdown (maybeToList header)
    H.toHtml $ zipWith (makeExercise sheet) [1 ..] exercises
    H.toHtml $ map renderMarkdown (maybeToList footer)

compile :: Options -> IO ()
compile (Options input output) = do
  content <- maybe getContents readFile input
  let yaml = decodeEither content
  case yaml of
    Left error -> print error
    Right s@(Sheet (CourseInfo title shortTitle term lecturers) (SheetInfo sheetTitle sheet issued due) _ exercises _)
      -> do
        let
          html = H.docTypeHtml $ do
            H.head $ do
              H.meta ! A.charset "UTF-8"
              H.title $ toHtml title
              H.link ! A.rel "stylesheet" ! A.href "style/normalize.css"
              H.link ! A.rel "stylesheet" ! A.href "lib/katex/katex.min.css"
              H.link ! A.rel "stylesheet" ! A.href "lib/codemirror/lib/codemirror.css"
              H.link ! A.rel "stylesheet" ! A.href "style/ublatt.css"
              H.script ! A.src "lib/katex/katex.min.js" $ mempty
              H.script ! A.src "lib/codemirror/lib/codemirror.js" $ mempty
              H.script ! A.src "lib/codemirror/mode/stex/stex.js" $ mempty
              H.script ! A.src "javascript/ublatt.js" $ mempty
            H.body $ H.form ! A.class_ "ublatt" $ makeSheet s
        putStrLn $ renderHtml html


main :: IO ()
main = compile =<< execParser opts where
  opts = info (Main.options <**> helper)
    ( fullDesc
   <> progDesc "Generates an interactive exercise sheet"
   <> O.header "ublatt v0.1.0 (© 2018 Martin Ring)")

data Options = Options {
  input :: Maybe FilePath,
  output :: Maybe FilePath
}

options :: Parser Options 
options = Options
  <$> optional (argument str
      (  metavar "SOURCE"
      <> help "The file to read from" ))
  <*> optional (strOption
      (  long "output"
      <> short 'o'
      <> metavar "TARGET"
      <> help "The file to write to"))
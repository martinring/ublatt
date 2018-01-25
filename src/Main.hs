{-# LANGUAGE OverloadedStrings #-}
module Main where

import Prelude hiding (div,head,span,writeFile)
import Model
import System.Environment (getArgs)
import Data.Yaml
import Text.Blaze.Html5 as H hiding (main,map)
import Text.Blaze.Html5.Attributes as A hiding (id)
import Text.Blaze
import Text.Blaze.Internal
import Text.Blaze.Html.Renderer.Utf8
import Data.ByteString.Lazy (writeFile)
import Control.Monad (forM_)
import Data.Monoid (mempty)
import Data.Text (Text,append,intercalate)
import Data.Char (toLower)
import Data.Maybe (fromMaybe, maybeToList)
import Text.Pandoc.Readers.Markdown
import Text.Pandoc.Writers.HTML
import Text.Pandoc.Options
import Text.Pandoc
import Text.Pandoc.Walk
import System.Process
import System.IO.Unsafe (unsafePerformIO)
import Debug.Trace (traceShowId)
import qualified Data.Map as Map

makeOptionalTitle :: Maybe Text -> Html
makeOptionalTitle title = forM_ title $ \title -> H.span ! class_ "title" $ toMarkup title

exerciseName :: Int -> Maybe Int -> Maybe Int -> AttributeValue
exerciseName e i s = stringValue $ 'a' : show e ++ maybe "" show i ++ maybe "" show s

markdownOptions :: ReaderOptions
markdownOptions = def {
  readerExtensions = pandocExtensions,
  readerStandalone = False
}

processMath :: Inline -> Inline
processMath (Text.Pandoc.Math tpe src) = Span attr [RawInline (Format "html") html]  
  where classes = case tpe of 
          InlineMath -> ["math","inline"]
          DisplayMath -> ["math","display"]
        attr = ("",classes,[])
        html = unsafePerformIO $ do
          let p = shell "katex"
          out <- readCreateProcess p src
          return out
processMath other = other


renderMarkdown :: Text -> Html
renderMarkdown txt = either renderError renderOutput result
  where result :: Either PandocError Html
        result = runPure $ do 
          pdoc <- readMarkdown markdownOptions txt          
          writeHtml5 def (walk processMath pdoc)
        renderError :: PandocError -> Html
        renderError error = do
          "Hallo"
        renderOutput :: Html -> Html
        renderOutput out = toHtml out

makeExercisePart :: Int -> Maybe Int -> ExercisePart -> Html
makeExercisePart e i (Model.Markdown src) = renderMarkdown src
makeExercisePart e i (Model.Image source float align) = do
  let cls = intercalate " " $ (map (append "float-") $ maybeToList float) ++
                              (map (append "align-") $ maybeToList align) ++ 
                              ["image"] 
  H.div ! class_ (textValue (cls)) $
      H.img ! A.src (textValue (source))
makeExercisePart e i (Input t) =
  H.textarea 
    ! class_ ((toValue . map toLower . show) t)
    ! name (exerciseName e i Nothing) $ mempty
makeExercisePart e i (Choice single choices) = do  
  H.ul $ do
    forM_ (zip choices [1..]) $ \(choice,ci) -> do
      H.li $ H.label $ do
        if fromMaybe False single
          then H.input 
                 ! type_ "radio" 
                 ! name (exerciseName e i Nothing)
                 ! value (textValue (choice))
          else H.input 
                 ! type_ "checkbox" 
                 ! name (exerciseName e i (Just ci))
                 ! value "yes"
        renderMarkdown choice
makeExercisePart e i (ChoiceTable single choices rows) = H.div ! class_ "figure" $ do
  let tpe = if fromMaybe False single then "radio" else "checkbox"
  H.table $ do
    H.thead $ 
      H.tr $ do
        H.th mempty
        forM_ choices (\c -> H.th $ renderMarkdown c)
    H.tbody $ 
      forM_ (zip rows [1..]) $ \(row, rowi) -> 
        H.tr $ do
          H.td ! class_ "choicetable_rh" $ renderMarkdown row
          forM_ choices $ \c -> H.td $ do
            H.input 
              ! type_ tpe 
              ! name (exerciseName e i (Just rowi))
              ! value (textValue (c))

isQPart :: ExercisePart -> Bool
isQPart (Model.Markdown _) = False
isQPart (Model.Image _ _ _) = False
isQPart _ = True

makeExercise :: Int -> Int -> Exercise -> Html    
makeExercise s n (Exercise title content) = do  
  let (qPartIndices,qParts) = unzip $ filter (isQPart . snd) $ zip [1..] content
  let renderedQParts =
        if (length qParts == 1) 
          then map (makeExercisePart n Nothing) qParts
          else zipWith (\ex i -> makeExercisePart n (Just i) ex) qParts [1..]
  let qPartMap = Map.fromList $ zip qPartIndices renderedQParts
  H.h2 $ do
    H.span ! class_ "exercisenum" $ do
      H.span ! class_ "exercisenum_sheet" $ toMarkup s
      H.span ! class_ "exercisenum_exercise" $ toMarkup n
    makeOptionalTitle title
  let renderIndexedExercisePart i e = 
        maybe (makeExercisePart 0 Nothing e) id $ Map.lookup i qPartMap
  toHtml $ zipWith renderIndexedExercisePart [1..] content

makeSheet (Sheet (CourseInfo title shortTitle term lecturers) (SheetInfo sheetTitle sheet issued due) header exercises footer) = do
  H.div ! class_ "head" $ do
    H.span ! class_ "title" $ toMarkup title
    H.span ! class_ "term" $ toMarkup term
    H.ul ! class_ "lecturers" $ forM_ lecturers $ li . toMarkup  
    H.span ! class_ "sheetnum" $ toMarkup sheet
    H.div ! class_ "dates" $ do
      forM_ issued $ (H.span ! class_ "issued") . toMarkup 
      forM_ due $ (H.span ! class_ "due") . toMarkup 
    makeOptionalTitle sheetTitle
  H.div ! class_ "main" $ do
    toHtml $ map (renderMarkdown) (maybeToList header)
    toHtml $ zipWith (makeExercise sheet) [1..] exercises 
    toHtml $ map (renderMarkdown) (maybeToList footer)

main :: IO ()
main = do
  [fileName] <- getArgs
  yaml <- decodeFileEither fileName
  case yaml of 
    Left error -> print error
    Right s@(Sheet (CourseInfo title shortTitle term lecturers) (SheetInfo sheetTitle sheet issued due) _ exercises _) -> do
      let html = docTypeHtml $ do
            H.head $ do
              H.meta ! charset "UTF-8" 
              H.title $ toMarkup title
              H.link ! rel "stylesheet" ! href "lib/katex/katex.min.css"
              H.link ! rel "stylesheet" ! href "lib/codemirror/lib/codemirror.css"
              H.link ! rel "stylesheet" ! href "lib/fonts/Sans/cmun-sans.css"
              H.link ! rel "stylesheet" ! href "lib/fonts/Serif/cmun-serif.css"
              H.link ! rel "stylesheet" ! href "style/ublatt.css"
              H.script ! src "lib/katex/katex.min.js" $ mempty
              H.script ! src "lib/codemirror/lib/codemirror.js" $ mempty
              H.script ! src "lib/codemirror/mode/stex/stex.js" $ mempty
              H.script ! src "javascript/ublatt.js" $ mempty
            H.body $ H.form ! class_ "ublatt" $ makeSheet s
      writeFile "index.html" $ renderHtml html
{-# LANGUAGE DeriveGeneric, DuplicateRecordFields #-}

module Model where

import GHC.Generics
import Data.Aeson.Types
import Control.Applicative
import Data.Text (Text)

data CourseInfo = CourseInfo {
  title :: Text,
  shortTitle :: Text,
  term :: Text,
  lecturers :: [Text]
} deriving (Generic,Show)

data Exercise = Exercise {
  title :: Maybe Text,  
  body :: [ExercisePart]
} deriving (Generic,Show)

data InputType = Free | Math | Code deriving (Generic,Show)

data ExercisePart = Markdown {
  source :: Text
} | Image {
  source :: Text,
  float :: Maybe Text,
  align :: Maybe Text
} | Input {
  inputType :: InputType,
  inputLanguage :: Maybe Text
} | Choice {
  single :: Maybe Bool,  
  compact :: Maybe Bool,
  choices :: [Text]
} | ChoiceTable {
  single :: Maybe Bool,
  choices :: [Text],
  rows :: [Text]
} | Combine {
  left :: [Text],
  right :: [Text]
} deriving (Generic,Show)

data SheetInfo = SheetInfo {
  title :: Maybe Text,  
  number :: Int,
  issued :: Maybe Text,
  due :: Maybe Text
} deriving (Generic,Show)

data Sheet = Sheet {
  course :: CourseInfo,
  sheet :: SheetInfo,
  header :: Maybe Text,
  exercises :: [Exercise],
  footer :: Maybe Text
} deriving (Generic,Show)


-- JSON Parsing

options = defaultOptions {
  fieldLabelModifier = camelTo2 '-',
  constructorTagModifier = camelTo2 '-',
  sumEncoding = ObjectWithSingleField
}

instance FromJSON CourseInfo where
  parseJSON = genericParseJSON options

instance FromJSON InputType where
  parseJSON = genericParseJSON options
  
instance FromJSON ExercisePart where  
  parseJSON v =
    fmap Markdown (parseJSON v) <|>    
    genericParseJSON options v
  
instance FromJSON Exercise where
  parseJSON = genericParseJSON options

instance FromJSON SheetInfo where
  parseJSON = genericParseJSON options

instance FromJSON Sheet where
  parseJSON = genericParseJSON options
import { StreamLanguage } from '@codemirror/next/stream-parser';
StreamLanguage.define({
    startState: function () {
        return {};
    },
    token: function (stream, state) {
        if (stream.eatSpace()) {
            return "whitespace";
        }
    }
});

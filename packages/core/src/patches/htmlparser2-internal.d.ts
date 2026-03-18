export { }

declare module 'htmlparser2' {
  interface TokenizerCallbacks {
    onattribdata(value: string): void;
    onattribend(): void;
    onattribname(name: string): void;
    oncdata(data: string): void;
    oncomment(data: string): void;
    ondeclaration(data: string): void;
    onend(): void;
    onerror(error: Error, state?: number): void;
    onopentagend(): void;
    onprocessinginstruction(name: string, value: string): void;
    onselfclosingtag(): void;
    ontext(data: string): void;
  }

  export class Tokenizer {
    constructor(options: any, cbs: TokenizerCallbacks);
    // Internal state
    _state: number;
    _buffer: string;
    _sectionStart: number;
    _index: number;
    _bufferOffset: number;
    _baseState: number;
    _special: number;
    _cbs: TokenizerCallbacks;
    _running: boolean;
    _ended: boolean;
    _xmlMode: boolean;
    _decodeEntities: boolean;

    // MarkBind-added properties (set by patch)
    specialTagNames: string[];
    _matchingSpecialTagIndexes: number[];
    _nextSpecialTagMatchIndex: number;

    // Internal helpers
    _getSection(): string;
    _emitToken(name: string): void;
    _cleanup(): void;

    // State handler methods (original htmlparser2 internals)
    _stateText(c: string): void;
    _stateBeforeTagName(c: string): void;
    _stateInTagName(c: string): void;
    _stateBeforeCloseingTagName(c: string): void;
    _stateInCloseingTagName(c: string): void;
    _stateAfterCloseingTagName(c: string): void;
    _stateBeforeAttributeName(c: string): void;
    _stateInSelfClosingTag(c: string): void;
    _stateInAttributeName(c: string): void;
    _stateAfterAttributeName(c: string): void;
    _stateBeforeAttributeValue(c: string): void;
    _stateInAttributeValueDoubleQuotes(c: string): void;
    _stateInAttributeValueSingleQuotes(c: string): void;
    _stateInAttributeValueNoQuotes(c: string): void;
    _stateBeforeDeclaration(c: string): void;
    _stateInDeclaration(c: string): void;
    _stateInProcessingInstruction(c: string): void;
    _stateBeforeComment(c: string): void;
    _stateInComment(c: string): void;
    _stateAfterComment1(c: string): void;
    _stateAfterComment2(c: string): void;
    _stateBeforeCdata1(c: string): void;
    _stateBeforeCdata2(c: string): void;
    _stateBeforeCdata3(c: string): void;
    _stateBeforeCdata4(c: string): void;
    _stateBeforeCdata5(c: string): void;
    _stateBeforeCdata6(c: string): void;
    _stateInCdata(c: string): void;
    _stateAfterCdata1(c: string): void;
    _stateAfterCdata2(c: string): void;
    _stateBeforeSpecial(c: string): void;
    _stateBeforeSpecialEnd(c: string): void;
    _stateBeforeEntity(c: string): void;
    _stateBeforeNumericEntity(c: string): void;
    _stateInNamedEntity(c: string): void;
    _stateInNumericEntity(c: string): void;
    _stateInHexEntity(c: string): void;

    // MarkBind-added state handlers (set by patch)
    _matchSpecialTagsFirstCharacters(c: string): boolean;
    _matchSpecialTagsNextCharacters(c: string): number;
    _matchNextSpecialTagClosingCharacter(c: string): number;
    _parse(): void;
  }

  export interface Parser {
    _attribname: string;
    _closeCurrentTag(): void;
  }
}

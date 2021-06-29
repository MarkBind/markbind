/*
 * Three behaviours of htmlparser2 are patched here, the first 2 being 'convenience' patches
 * to avoid repeated passing of lowerCaseAttributeNames and recognizeSelfClosing options.
 * 1. Defaulting to self closing tag recognition
 * 2. Disabling automatic attribute name conversion to lower case
 * 3. Ability to inject/whitelist certain tags to be parsed like script/style tags do. ('special' tags)
 */

const { Tokenizer, Parser } = require('htmlparser2');

/*
 Enable any self closing tags '<xx />' to be parsed.
 This allows MarkBind's own components to be recognised as such (e.g. '<panel />').
 This is equivalent to the { recognizeSelfClosing: true } option of htmlparser2;
 We modify the relevant code to avoid passing it in repeatedly.
 */
Parser.prototype.onselfclosingtag = function () {
  this._closeCurrentTag();
};

/*
 Disable automatic lower case conversion.
 This is equivalent to the { lowerCaseAttributeNames: false } option of htmlparser2;
 We modify the relevant code to avoid passing it in repeatedly as well.
 */
Parser.prototype.onattribname = function (name) {
  this._attribname = name;
};

/* eslint-disable
    brace-style,
    indent,
    keyword-spacing,
    max-len,
    no-mixed-spaces-and-tabs,
    no-multi-spaces,
    no-plusplus,
    no-tabs,
    no-unused-vars,
    no-var,
    one-var,
    quotes,
    semi,
    space-before-blocks,
    space-before-function-paren,
    spaced-comment,
    vars-on-top,
*/

var i = 0,

    TEXT                      = i++,
    BEFORE_TAG_NAME           = i++, //after <
    IN_TAG_NAME               = i++,
    IN_SELF_CLOSING_TAG       = i++,
    BEFORE_CLOSING_TAG_NAME   = i++,
    IN_CLOSING_TAG_NAME       = i++,
    AFTER_CLOSING_TAG_NAME    = i++,

    //attributes
    BEFORE_ATTRIBUTE_NAME     = i++,
    IN_ATTRIBUTE_NAME         = i++,
    AFTER_ATTRIBUTE_NAME      = i++,
    BEFORE_ATTRIBUTE_VALUE    = i++,
    IN_ATTRIBUTE_VALUE_DQ     = i++, // "
    IN_ATTRIBUTE_VALUE_SQ     = i++, // '
    IN_ATTRIBUTE_VALUE_NQ     = i++,

    //declarations
    BEFORE_DECLARATION        = i++, // !
    IN_DECLARATION            = i++,

    //processing instructions
    IN_PROCESSING_INSTRUCTION = i++, // ?

    //comments
    BEFORE_COMMENT            = i++,
    IN_COMMENT                = i++,
    AFTER_COMMENT_1           = i++,
    AFTER_COMMENT_2           = i++,

    //cdata
    BEFORE_CDATA_1            = i++, // [
    BEFORE_CDATA_2            = i++, // C
    BEFORE_CDATA_3            = i++, // D
    BEFORE_CDATA_4            = i++, // A
    BEFORE_CDATA_5            = i++, // T
    BEFORE_CDATA_6            = i++, // A
    IN_CDATA                  = i++, // [
    AFTER_CDATA_1             = i++, // ]
    AFTER_CDATA_2             = i++, // ]

    //special tags
    BEFORE_SPECIAL            = i++, //S
    BEFORE_SPECIAL_END        = i++,   //S

	/*
	 SCRIPT and STYLE states are preserved to maintain consistency of
	 un-patched methods using state numbers greater than them in htmlparser2.
	 */
    BEFORE_SCRIPT_1           = i++, //C
    BEFORE_SCRIPT_2           = i++, //R
    BEFORE_SCRIPT_3           = i++, //I
    BEFORE_SCRIPT_4           = i++, //P
    BEFORE_SCRIPT_5           = i++, //T
    AFTER_SCRIPT_1            = i++, //C
    AFTER_SCRIPT_2            = i++, //R
    AFTER_SCRIPT_3            = i++, //I
    AFTER_SCRIPT_4            = i++, //P
    AFTER_SCRIPT_5            = i++, //T

    BEFORE_STYLE_1            = i++, //T
    BEFORE_STYLE_2            = i++, //Y
    BEFORE_STYLE_3            = i++, //L
    BEFORE_STYLE_4            = i++, //E
    AFTER_STYLE_1             = i++, //T
    AFTER_STYLE_2             = i++, //Y
    AFTER_STYLE_3             = i++, //L
    AFTER_STYLE_4             = i++, //E

    BEFORE_ENTITY             = i++, //&
    BEFORE_NUMERIC_ENTITY     = i++, //#
    IN_NAMED_ENTITY           = i++,
    IN_NUMERIC_ENTITY         = i++,
    IN_HEX_ENTITY             = i++, //X

	SPECIAL_NONE              = 0,

	/*
	 Non parser-state constants
	 */

	// _matchSpecialTagsNextCharacters, _matchNextSpecialTagClosingCharacter
	HAS_MATCHING              = -1,
	NO_MATCH                  = -2,
	HAS_MATCHED               = -3;

const DEFAULT_SPECIAL_TAGS = [
	'script',
	'site-nav',
	'style',
	'variable',
	'markdown',
	'md',
];

function whitespace(c) {
	return c === " " || c === "\n" || c === "\t" || c === "\f" || c === "\r";
}

Tokenizer.prototype.specialTagNames = [...DEFAULT_SPECIAL_TAGS];

/**
 * Checks whether the token matches one of the first characters of the special tags,
 * and initialises the _matchingSpecialTagIndexes array with the matches' indexes if so.
 */
Tokenizer.prototype._matchSpecialTagsFirstCharacters = function(c) {
	this._matchingSpecialTagIndexes = [];
	const numSpecialTags = this.specialTagNames.length;
	const lowerCaseChar = c.toLowerCase();
	for (let j = 0; j < numSpecialTags; j += 1) {
		if (lowerCaseChar === this.specialTagNames[j][0]) {
			this._matchingSpecialTagIndexes.push(j)
		}
	}

	if (this._matchingSpecialTagIndexes.length > 0) {
		this._nextSpecialTagMatchIndex = 1;
		return true;
	}
	return false;
};

/**
 * Processes the _matchingSpecialTagIndexes array, filtering out previous match indexes
 * that do not match the current token.
 * If one of the previous matches successfully matched, the match index is returned.
 */
Tokenizer.prototype._matchSpecialTagsNextCharacters = function(c) {
	const matchingSpecialTags = [];
	const numMatchingTags = this._matchingSpecialTagIndexes.length;
	const lowerCaseChar = c.toLowerCase();

	for (let j = 0; j < numMatchingTags; j += 1) {
		const tagIndex = this._matchingSpecialTagIndexes[j];
		const testChar = this.specialTagNames[tagIndex][this._nextSpecialTagMatchIndex];

		if (testChar === undefined) {
			if (c === "/" || c === ">" || whitespace(c)) {
				return tagIndex;
			}
		} else if (testChar === lowerCaseChar) {
			matchingSpecialTags.push(tagIndex);
		}
	}

	this._matchingSpecialTagIndexes = matchingSpecialTags;

	return this._matchingSpecialTagIndexes.length > 0
		? HAS_MATCHING
		: NO_MATCH;
};

/**
 * Changes the Tokenizer state to BEFORE_SPECIAL if the token matches one of
 * the first characters of _specialTagNames.
 */
Tokenizer.prototype._stateBeforeTagName = function(c) {
	if (c === "/") {
		this._state = BEFORE_CLOSING_TAG_NAME;
	} else if (c === "<") {
		this._cbs.ontext(this._getSection());
		this._sectionStart = this._index;
	} else if (c === ">" || this._special !== SPECIAL_NONE || whitespace(c)) {
		this._state = TEXT;
	} else if (c === "!") {
		this._state = BEFORE_DECLARATION;
		this._sectionStart = this._index + 1;
	} else if (c === "?") {
		this._state = IN_PROCESSING_INSTRUCTION;
		this._sectionStart = this._index + 1;
	} else {
		// We want special tag treatment to be xmlMode independent for MarkBind.
		this._state = this._matchSpecialTagsFirstCharacters(c)
			? BEFORE_SPECIAL
			: IN_TAG_NAME;
		this._sectionStart = this._index;
	}
};

/**
 * Changes the Tokenizer state to IN_TAG_NAME or BEFORE_SPECIAL state again depending
 * on whether there are still matches in _matchingSpecialTagIndexes.
 */
Tokenizer.prototype._stateBeforeSpecial = function(c) {
	const result = this._matchSpecialTagsNextCharacters(c);
	if (result === HAS_MATCHING) {
		this._nextSpecialTagMatchIndex += 1;
		return;
	}

	// Reset for _matchNextSpecialTagClosingCharacter later
	this._nextSpecialTagMatchIndex = 0;

	this._state = IN_TAG_NAME;
	this._index--; //consume the token again

	if (result === NO_MATCH) {
		return;
	}

	/*
	 Assign the one-based index of the matching tag in the special tags array.
	 This is due to htmlparser2 using 0 for SPECIAL_NONE,
	 which would conflict with a zero-based index.
	*/
	this._special = result + 1;
};

/**
 * Patched self closing tag state handler that removes the special state
 * if the special tag was self-closed.
 */
Tokenizer.prototype._stateInSelfClosingTag = function(c) {
	if (c === ">") {
		this._cbs.onselfclosingtag();
		this._state = TEXT;
		this._sectionStart = this._index + 1;
		/*
		 Allow all special tags to be self-closed.
		 Script and style tags are also allowed to be self-closed,
		 which breaks from the default html spec-compliant of behaviour of htmlparser2.
		 We allow this as such tags would be expanded upon re-rendering the html anyway.
		 ie. '<script ... />' would end up as '<script ...></script>'
		 */
		this._special = SPECIAL_NONE;
	} else if (!whitespace(c)) {
		this._state = BEFORE_ATTRIBUTE_NAME;
		this._index--;
	}
};

/**
 * Processes the _special flag and _nextSpecialTagMatchIndex state variable,
 * returning a flag indicating whether the current special tag has finished matching or not.
 */
Tokenizer.prototype._matchNextSpecialTagClosingCharacter = function(c) {
	const nextTestChar = this.specialTagNames[this._special - 1][this._nextSpecialTagMatchIndex];

	if (nextTestChar === undefined) {
		this._nextSpecialTagMatchIndex = 0;
		return (c === ">" || whitespace(c))
			? HAS_MATCHED
			: NO_MATCH;
	} else if (nextTestChar === c.toLowerCase()) {
		this._nextSpecialTagMatchIndex += 1;
		return HAS_MATCHING;
	}

	this._nextSpecialTagMatchIndex = 0;
	return NO_MATCH;
};

/**
 * Changes the Tokenizer state to BEFORE_SPECIAL_END if the token matches one of
 * the first character of the currently matched special tag.
 */
Tokenizer.prototype._stateBeforeCloseingTagName = function(c) {
	if (whitespace(c));
	else if (c === ">") {
		this._state = TEXT;
	} else if (this._special !== SPECIAL_NONE) {
		if (this._matchNextSpecialTagClosingCharacter(c) !== NO_MATCH) {
			this._state = BEFORE_SPECIAL_END;
		} else {
			this._state = TEXT;
			this._index--;
		}
	} else {
		this._state = IN_CLOSING_TAG_NAME;
		this._sectionStart = this._index;
	}
};

/**
 * Changes the Tokenizer state back to TEXT, IN_TAG_NAME depending
 * on whether the token has finished or is still matching
 * the currently matched special tag.
 */
Tokenizer.prototype._stateBeforeSpecialEnd = function(c) {
	const result = this._matchNextSpecialTagClosingCharacter(c);
	if (result === HAS_MATCHING) {
		return;
	}

	if (result === HAS_MATCHED) {
		this._sectionStart = this._index - this.specialTagNames[this._special - 1].length;
		this._special = SPECIAL_NONE;
		this._state = IN_CLOSING_TAG_NAME;
		this._index--; //reconsume the token
		return;
	}

	this._index--;
	this._state = TEXT;
};

/**
 * Altered _parse handler that handles the extra MARKDOWN state.
 * BEFORE/AFTER SCRIPT and STYLE state handlers are made redundant
 * by the above patches and removed as well.
 */
Tokenizer.prototype._parse = function(){
	while(this._index < this._buffer.length && this._running){
		var c = this._buffer.charAt(this._index);

		if(this._state === TEXT){
			this._stateText(c);
		} else if(this._state === BEFORE_TAG_NAME){
			this._stateBeforeTagName(c);
		} else if(this._state === IN_TAG_NAME){
			this._stateInTagName(c);
		} else if(this._state === BEFORE_CLOSING_TAG_NAME){
			this._stateBeforeCloseingTagName(c);
		} else if(this._state === IN_CLOSING_TAG_NAME){
			this._stateInCloseingTagName(c);
		} else if(this._state === AFTER_CLOSING_TAG_NAME){
			this._stateAfterCloseingTagName(c);
		} else if(this._state === IN_SELF_CLOSING_TAG){
			this._stateInSelfClosingTag(c);
		}

		/*
		*	attributes
		*/
		else if(this._state === BEFORE_ATTRIBUTE_NAME){
			this._stateBeforeAttributeName(c);
		} else if(this._state === IN_ATTRIBUTE_NAME){
			this._stateInAttributeName(c);
		} else if(this._state === AFTER_ATTRIBUTE_NAME){
			this._stateAfterAttributeName(c);
		} else if(this._state === BEFORE_ATTRIBUTE_VALUE){
			this._stateBeforeAttributeValue(c);
		} else if(this._state === IN_ATTRIBUTE_VALUE_DQ){
			this._stateInAttributeValueDoubleQuotes(c);
		} else if(this._state === IN_ATTRIBUTE_VALUE_SQ){
			this._stateInAttributeValueSingleQuotes(c);
		} else if(this._state === IN_ATTRIBUTE_VALUE_NQ){
			this._stateInAttributeValueNoQuotes(c);
		}

		/*
		*	declarations
		*/
		else if(this._state === BEFORE_DECLARATION){
			this._stateBeforeDeclaration(c);
		} else if(this._state === IN_DECLARATION){
			this._stateInDeclaration(c);
		}

		/*
		*	processing instructions
		*/
		else if(this._state === IN_PROCESSING_INSTRUCTION){
			this._stateInProcessingInstruction(c);
		}

		/*
		*	comments
		*/
		else if(this._state === BEFORE_COMMENT){
			this._stateBeforeComment(c);
		} else if(this._state === IN_COMMENT){
			this._stateInComment(c);
		} else if(this._state === AFTER_COMMENT_1){
			this._stateAfterComment1(c);
		} else if(this._state === AFTER_COMMENT_2){
			this._stateAfterComment2(c);
		}

		/*
		*	cdata
		*/
		else if(this._state === BEFORE_CDATA_1){
			this._stateBeforeCdata1(c);
		} else if(this._state === BEFORE_CDATA_2){
			this._stateBeforeCdata2(c);
		} else if(this._state === BEFORE_CDATA_3){
			this._stateBeforeCdata3(c);
		} else if(this._state === BEFORE_CDATA_4){
			this._stateBeforeCdata4(c);
		} else if(this._state === BEFORE_CDATA_5){
			this._stateBeforeCdata5(c);
		} else if(this._state === BEFORE_CDATA_6){
			this._stateBeforeCdata6(c);
		} else if(this._state === IN_CDATA){
			this._stateInCdata(c);
		} else if(this._state === AFTER_CDATA_1){
			this._stateAfterCdata1(c);
		} else if(this._state === AFTER_CDATA_2){
			this._stateAfterCdata2(c);
		}

		/*
		* special tags
		*/
		else if(this._state === BEFORE_SPECIAL){
			this._stateBeforeSpecial(c);
		} else if(this._state === BEFORE_SPECIAL_END){
			this._stateBeforeSpecialEnd(c);
		}

		/*
		* entities
		*/
		else if(this._state === BEFORE_ENTITY){
			this._stateBeforeEntity(c);
		} else if(this._state === BEFORE_NUMERIC_ENTITY){
			this._stateBeforeNumericEntity(c);
		} else if(this._state === IN_NAMED_ENTITY){
			this._stateInNamedEntity(c);
		} else if(this._state === IN_NUMERIC_ENTITY){
			this._stateInNumericEntity(c);
		} else if(this._state === IN_HEX_ENTITY){
			this._stateInHexEntity(c);
		}

		else {
			this._cbs.onerror(Error("unknown _state"), this._state);
		}

		this._index++;
	}

	this._cleanup();
};

/**
 * Injects the tagsToIgnore into the Tokenizer's specialTagNames.
 */
function injectIgnoreTags(tagsToIgnore) {
	Tokenizer.prototype.specialTagNames = [...DEFAULT_SPECIAL_TAGS, ...tagsToIgnore];
}

module.exports = {
  injectIgnoreTags,
};

**Default contact us form**

<web-3-form default />

**Form with default inputs**

<web-3-form>
<name-input></name-input>
<message-input></message-input>
<submit-button></submit-button>
</web-3-form>

**Form with customised inputs**
<web-3-form>
<input type="radio" id="html" name="fav_language" value="HTML">
<label for="html">HTML</label><br>
<input type="radio" id="css" name="fav_language" value="CSS">
<label for="css">CSS</label><br>
<input type="radio" id="javascript" name="fav_language" value="JavaScript">
<label for="javascript">JavaScript</label>
<br>
<input list="browsers">
<datalist id="browsers">
    <option value="Internet Explorer">
    <option value="Firefox">
    <option value="Chrome">
    <option value="Opera">
    <option value="Safari">
</datalist>
<br>
<submit-button></submit-button>
</web-3-form>

**Form with customised options**
<web-3-form default type="warning" header="### :rocket: I am a header" />

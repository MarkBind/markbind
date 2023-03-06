### Plugin: Web3Forms 

This plugin allows you to create forms whose response will be sent directly to your email, using the [Web3Form](https://web3forms.com/) API. 
<box type="warning" seamless>
Emails from Web3Forms may end up in spam/junk mail.
</box>

<box type="warning" seamless>
The free plan from Web3Form only allows 250 submissions per month.
</box>

To set it up, get an access key from [Web3Forms](https://web3forms.com/). Then add `web3Form` to your site's plugin, and add the `accessKey` parameter via the `pluginsContext`.
| Name      | Type     | Default                                            | Description |
|-----------|----------|----------------------------------------------------|-------------|
| accessKey | `String` || accessKey is required. It is provided by Web3Form. |

```js {heading="site.json"}
{
  ...
  "plugins": [
    "web3Form"
  ],
  "pluginsContext": {
    "web3Form": {
      "accessKey": "YOUR_WEB_3_FORM_ACCESS_KEY" // replace with your Web3Form access key 
    }
  }
}
```

<box type="warning" seamless>
The access key is exposed to public. 
Malicious users might use the access key in other forms. 
This might subject the email linked to the access key to spam with irrelevant form submissions.
</box>

**To add a form to your site, use a `<web-3-form>` tag.**

<include src="codeAndOutput.md" boilerplate>
<variable name="highlightStyle">html</variable>
<variable name="code">
<web-3-form header="Contact Us">
    <label for="name">Name</label>
    <input type="text" name="name" required placeholder="John Doe">
    <button type="submit">Submit</button>
</web-3-form>
</variable>
</include>

**Web3Form plugin also supports a default 'Contact Us' form.**

The header will be ```<h2>Contact Us</h2>``` for the default form if no header is specified.

<include src="codeAndOutput.md" boilerplate>
<variable name="highlightStyle">html</variable>
<variable name="code">
<web-3-form default />
</variable>
</include>

<include src="codeAndOutput.md" boilerplate>
<variable name="highlightStyle">html</variable>
<variable name="code">
<web-3-form default header="### New header"/>
</variable>
</include>

**Web3Form plugin supports common inputs.**

The inputs supported are 
* `name-input`
* `email-input`
* `message-input`
* `submit-button`

<include src="codeAndOutput.md" boilerplate>
<variable name="highlightStyle">html</variable>
<variable name="code">
<web-3-form header="### Form with name input">
<name-input></name-input>
</web-3-form>

<web-3-form header="### Form with email input">
<email-input></email-input>
</web-3-form>

<web-3-form header="### Form with message input">
<message-input></message-input>
</web-3-form>

<web-3-form header="### Form with submit button">
<submit-button></submit-button>
</web-3-form>

</variable>
</include>

**Web3Form plugin supports customised header and styles**

Options from the [box component](../components/presentation.html#boxes) are supported here.

<include src="codeAndOutput.md" boilerplate>
<variable name="highlightStyle">html</variable>
<variable name="code">
<web-3-form default type="warning" header="Here's a form :rocket:" color="red" dismissible>
</web-3-form>
</variable>
</include>

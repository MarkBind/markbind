# Thumbnail test

## Images

### Square thumb, size = 100 (default)
<thumbnail src="http://placehold.it/800x600" />

### Square thumb with alt="Test"
<thumbnail alt="Test" src="asdf" />

### Square thumb, size = 200
<thumbnail src="http://placehold.it/800x600" size='200' />

### Circle thumbs, size = 100
<thumbnail src="http://placehold.it/800x600" circle />
<thumbnail src="http://placehold.it/100x300" circle />

### An actual image
<thumbnail circle size=300 src="images/deer.jpg" />
<pic src="images/deer.jpg" height=300 />

---

### Broken link, still takes up the space it's supposed to

<thumbnail src="/broken_link" border/>
<thumbnail src="http://placehold.it/300x100"/>

---

## Borders

Thumbnail | Attribute | Description
-----|-----|---------
<thumbnail src="http://placehold.it/300x100" />| |no border
<thumbnail border='3px solid red' src="http://placehold.it/300x100" />|`border='3px solid red'`|3 pixel thick solid red line
<thumbnail border='4px dotted blue' src="http://placehold.it/300x100" />|`4px dotted blue`|4 pixel thick dotted blue line

---

## Background

### Valid CSS properties
<thumbnail background="lightblue" circle />
<thumbnail background="#aaf" circle />
<thumbnail background="rgba(120, 120, 200, 0.4)" circle />

### Invalid CSS properties
<thumbnail background="asdf" border="1px solid black" circle />

### Empty
<thumbnail background="" border="1px solid black" circle />

---

## Text/Emojis/Icons

### Text
<thumbnail text="test" border='1px solid black' circle />

### Markdown
<thumbnail text="_test_" border='1px solid black' circle />
<thumbnail text="**test**" border='1px solid black' circle />

### Emojis
<thumbnail text=":x:" border='1px solid black' circle />
<thumbnail text=":eggplant:" border='1px solid black' circle />

### Icons
<thumbnail text=":fab-github:" border='1px solid black' circle />
<thumbnail text=":glyphicon-book:" background="#666" font-color="#eee" circle />

---

## font-size/font-color

### 20px font-size
<thumbnail text="test" border='1px solid black' font-size=20 circle />

### 40px font-size
<thumbnail text="test" border='1px solid black' font-size=40 circle />

### font-color
<thumbnail text="blue" border='1px solid black' font-color="#669" circle />
<thumbnail text="maroon" border='1px solid black' font-color="maroon" font-size="25" circle />

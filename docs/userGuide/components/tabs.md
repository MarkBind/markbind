## Tabs

<tip-box border-left-color="#00B0F0">
  <i style="font-style: normal; font-weight: bold; color: dimgray">Example</i><br>
  <tabs>
    <tab header="First tab">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla ullamcorper ultrices lobortis. Aenean leo lacus, congue vel auctor a, tincidunt sed nunc. Integer in odio sed nunc porttitor venenatis. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nullam fringilla tincidunt augue a pulvinar.
    </tab>
    <tab header="Disabled second tab :x:" disabled> 
    </tab>
    <tab-group header="Third tab group :milky_way:">
      <tab header="Stars :star:">
        Every star you see in the night sky is bigger and brighter than our sun. Of the 5,000 or so stars brighter than magnitude 6, only a handful of very faint stars are approximately the same size and brightness of our sun and the rest are all bigger and brighter. Of the 500 or so that are brighter than 4th magnitude (which includes essentially every star visible to the unaided eye from a urban location), all are intrinsically bigger and brighter than our sun, many by a large percentage. Of the brightest 50 stars visible to the human eye from Earth, the least intrinsically bright is Alpha Centauri, which is still more than 1.5 times more luminous than our sun, and cannot be easily seen from most of the Northern Hemisphere.<br><br>Source: <md>[earthsky.org](http://earthsky.org/space/ten-things-you-may-not-know-about-stars)</md>
      </tab>
      <tab header="Disabled Moon :new_moon:" disabled>
      </tab>
    </tab-group>
    <tab-group header="Disabled fourth tab group" disabled>
      <tab header="Hidden tab">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla ullamcorper ultrices lobortis.
      </tab>
    </tab-group>
  </tabs>
</tip-box>

<tip-box border-left-color="black">
<i style="font-style: normal; font-weight: bold; color: dimgray">Markup</i>

```html
<tabs>
  <tab header="First tab">
    ...
  </tab>
  <tab header="Disabled second tab :x:" disabled> 
  </tab>
  <tab-group header="Third tab group :milky_way:">
    <tab header="Stars :star:">
      star facts 
    </tab>
    <tab header="Disabled Moon :new_moon:" disabled>
    </tab>
  </tab-group>
  <tab-group header="Disabled fourth tab group" disabled>
    <tab header="Hidden tab">
      ...
    </tab>
  </tab-group>
</tabs>
```
</tip-box>
<br>

#### Tabs Options (container)
Name | Type | Default | Description
--- | --- | --- | ---
active | `Number` | `0` | Active Tab index (0-based)

#### Tab Options (element)
Name | Type | Default | Description
--- | --- | --- | ---
header | `String` | `null` | Tab title.
disabled | `Boolean` | `false` | Whether Tab is clickable and can be activated.

#### Tab Group Options (dropdown)
Name | Type | Default | Description
--- | --- | --- | ---
header | `String` | `null` | Tab Group title.
disabled | `Boolean` | `false` | Whether Tab Group is clickable and can be activated.

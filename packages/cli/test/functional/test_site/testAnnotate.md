**Annotate with saved Image**

<annotate src="./images/annotateSampleImage.png" width="500" alt="sampleImage">
  <a-point x="25%" y="25%" content="Lorem ipsum dolor sit amet" />
</annotate>

<br>

**Annotate point positions**

<!-- Small Width -->
<annotate src="./images/annotateSampleImage.png" width="350" alt="sampleImage">
  <a-point x="0%" y="0%" content="Lorem ipsum dolor sit amet" />
  <a-point x="50%" y="50%" content="Lorem ipsum dolor sit amet" />
  <a-point x="100%" y="100%" content="Lorem ipsum dolor sit amet" />
</annotate>

<!-- Regular Width -->
<annotate src="./images/annotateSampleImage.png" width="600" alt="sampleImage">
  <a-point x="0%" y="0%" content="Lorem ipsum dolor sit amet" />
  <a-point x="50%" y="50%" content="Lorem ipsum dolor sit amet" />
  <a-point x="100%" y="100%" content="Lorem ipsum dolor sit amet" />
</annotate>

<!-- Large Width -->
<annotate src="./images/annotateSampleImage.png" width="1500" alt="sampleImage">
  <a-point x="0%" y="0%" content="Lorem ipsum dolor sit amet" />
  <a-point x="50%" y="50%" content="Lorem ipsum dolor sit amet" />
  <a-point x="100%" y="100%" content="Lorem ipsum dolor sit amet" />
</annotate>

<br>

**Annotate point attributes**

<!-- Visual Attributes -->
<annotate src="./images/annotateSampleImage.png" width="350" alt="sampleImage">
  <a-point x="25%" y="25%" content="Lorem ipsum dolor sit amet" />
  <a-point x="50%" y="25%" content="Lorem ipsum dolor sit amet"  size="60"/>
  <a-point x="75%" y="25%" content="Lorem ipsum dolor sit amet"  header="Lorem ipsum"/>
  <a-point x="33%" y="50%" content="Lorem ipsum dolor sit amet"  color="red"/>
  <a-point x="66%" y="50%" content="Lorem ipsum dolor sit amet"  opacity="0.7"/>
  <a-point x="25%" y="75%" content="Lorem ipsum dolor sit amet" label="1"/>
  <a-point x="50%" y="75%" content="Lorem ipsum dolor sit amet"  textColor="white" color="black" label="2" opacity="1"/>
  <a-point x="75%" y="75%" content="Lorem ipsum dolor sit amet"  fontSize="30" label="3"/>
</annotate>

<!-- Triggers -->
<annotate src="./images/annotateSampleImage.png" width="600" alt="sampleImage">
  <a-point x="33%" y="33%" content="Lorem ipsum dolor sit amet" />
  <a-point x="66%" y="33%" content="Lorem ipsum dolor sit amet" trigger="hover focus"/>
  <a-point x="25%" y="66%" content="Lorem ipsum dolor sit amet" placement="left"/>
  <a-point x="50%" y="66%" content="Lorem ipsum dolor sit amet" placement="bottom"/>
  <a-point x="75%" y="66%" content="Lorem ipsum dolor sit amet" placement="right"/>
</annotate>

<!-- Legends -->
<annotate src="./images/annotateSampleImage.png" width="1500" alt="sampleImage">
  <a-point x="25%" y="50%" content="some test text" label="1"/>
  <a-point x="50%" y="50%" content="some test text" label="2" legend="bottom" header="some test text"/>
  <a-point x="75%" y="50%" content="some test text"  label="3" legend="both" header="some test text"/>
</annotate>

<!-- Many Legends Some with headers some without -->
<annotate src="./images/annotateSampleImage.png" width="1500" alt="sampleImage">
  <a-point x="25%" y="25%" content="some test text" label="1" legend="both"/>
  <a-point x="50%" y="25%" content="some test text" label="2" legend="both" />
  <a-point x="75%" y="25%" content="some test text"  label="3" legend="both" />
  <a-point x="25%" y="50%" content="some test text"  label="4" legend="both" header="some test text"/>
  <a-point x="50%" y="50%" content="some test text"  label="5" legend="both" header="some test text"/>
  <a-point x="75%" y="50%" content="some test text"  label="6" legend="both" header="some test text"/>
</annotate>

**Annotate Point customised shapes**
<annotate src="./images/annotateSampleImage.png" width="1500" alt="sampleImage">
    <a-point x="25%" y="25%">
        <span class="badge rounded-pill bg-primary">Label</span>
    </a-point>
    <a-point x="50%" y="25%">
        <pic src="./images/deer.jpg" width="50" height="50" />
    </a-point>
    <a-point x="75%" y="25%">
        <div style="background-color: black; color: white; width: 100px; height: 50px;">Text label</div>
    </a-point>
</annotate>

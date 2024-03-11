<frontmatter>
  title: Portfolio
  layout: default.md
</frontmatter>

<br>

<div class="bg-dark text-white px-2 py-5 mb-4">
  <div class="container">
    <h1 class="display-5 no-index"><md>:wave:</md> Hello!<br>I'm {{ name }}</h1>
    <p class="lead">Welcome to my portfolio!</p>
  </div>
</div>

<box type="tip">
  Want to change the theme? Explore more themes and other components offered by MarkBind in our <a href="https://markbind.org/userGuide/authoringContents.html" target="_blank">user guide here</a>
</box>

---

## About me

<div class="card mb-3">
  <div class="row" >
    <div class="col-3">
      <img src='./contents/assets/default_profile_pic.png' alt='default-profile-pic'/>
    </div>
    <div class="col-9">
      <div class="card-body">
        <p class="card-text">This is where you can add a picture of yourself and a brief introduction. This can be a good place to use <tooltip content="Add more information here" placement="top">tooltips</tooltip>, or <md>[add relevant links](https://markbind.org/userGuide/formattingContents.html#links)</md>.</p>
      </div>
    </div>
  </div>
</div>

---

<include src="contents/skills.md"/>

---

<include src="contents/experience.md"/>

---

<include src="contents/projects.md"/>



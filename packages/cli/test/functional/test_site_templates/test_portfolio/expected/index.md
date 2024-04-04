<frontmatter>
  title: Portfolio
  layout: default.md
</frontmatter>

<br>

<div class="bg-light text-black px-2 py-5 mb-4">
  <div class="container">
    <h1 class="display-5 no-index"><md>:wave:</md> Hello!<br>I'm {{ name }}</h1>
    <p class="lead">Welcome to my portfolio!</p>
    <div style="margin-bottom:20px;">
      <span style="margin-right:10px;">
        <a href="https://github.com/MarkBind/markbind" target="_blank" class="icon">
          <i class="fa-brands fa-github fa-2xl"></i>
        </a>
      </span>
      <span style="margin-right:10px;">
        <a href="https://www.linkedin.com/school/national-university-of-singapore/" target="_blank" class="icon">
          <i class="fa-brands fa-linkedin fa-2xl"></i>
        </a>
      </span>
      <span style="margin-right:10px;">
        <a href="mailto:secretary_cs@comp.nus.edu.sg" target="_blank" class="icon">
          <i class="fa-solid fa-envelope fa-2xl"></i>
        </a>
      </span>
    </div>
    <a class="btn btn-primary" href="./contents/assets/UG-template-resume.pdf" target="_blank" rel="noopener noreferrer">Resume</a>
  </div>
</div>

<box type="tip">
  Want to change the theme? Explore more themes and other components offered by MarkBind in our <a href="https://markbind.org/userGuide/authoringContents.html" target="_blank">user guide here</a>.
</box>

<box type="info" header="##### Deploying this site">
    <md>MarkBind makes it easy to deploy this site to GitHub Pages using the `markbind deploy` command. To allow `http://[username].github.io` to go straight to this portfolio, it is best to set your repository name as `[username].github.io` Read more about [deploying the site here](https://markbind.org/userGuide/deployingTheSite.html#deploying-to-github-pages)</md>
</box>

---

## About me

<div class="container text-left">
  <div class="row" >
    <div class="col-md-3 col-md-push-9">
      <img src='./contents/assets/default_profile_pic.png' class="img-fluid" alt='default-profile-pic'/>
    </div>
    <div class="col-md-9 col-md-pull-3">
      This is where you can add a picture of yourself and a brief introduction. This can be a good place to use <tooltip content="Add more information here" placement="top">tooltips</tooltip>, or <md>[add relevant links](https://markbind.org/userGuide/formattingContents.html#links).</md>
    </div>
  </div>
</div>

---

<include src="contents/skills.md"/>

---

<include src="contents/experience.md"/>

---

<include src="contents/projects.md"/>

---



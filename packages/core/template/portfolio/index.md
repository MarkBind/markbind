<frontmatter>
  title: Home Page
  layout: default.md
  pageNav: 4
  pageNavTitle: "Topics"
</frontmatter>

<br>

<div class="bg-dark text-white px-2 py-5 mb-4">
  <div class="container">
    <h1 class="display-5 no-index">Hello!<br>You've just initialised a personal portfolio template in MarkBind</h1>
    <p class="lead">Here's what you can add...</p>
  </div>
</div>

---

## Hello there! I'm {{name}}

This is where you can add a picture of yourself and a brief introduction

<div class='container'>
  <img src='./contents/assests/default_profile_pic.png' alt='default-profile-pic'></img>
  <p style="padding-left:10px">You can use this area to give a brief introduction about yourself. You can include your github (
    <a href="https://github.com/MarkBind/markbind">
      <i class="fa-brands fa-github fa-lg"></i>
    </a>
    ), linkedIn (
    <a href="https://www.linkedin.com/school/national-university-of-singapore/">
      <i class="fa-brands fa-linkedin fa-lg"></i>
    </a>
    ), and other important links. You can also give a quick overview of the technologies and frameworks you know using our <a href="https://markbind.org/userGuide/components/imagesAndDiagrams.html#thumbnails" target="_blank">thumbnail feature</a> or our <a href="https://markbind.org/userGuide/formattingContents.html#icons" target="_blank">icons</a>. 
  </p>
  <panel header="Example using thumbnails" minimized>
    <thumbnail src='./contents/assests/JavaScript.svg' size="100"/>
    <thumbnail src='./contents/assests/Typescript.svg' size="100"/>
    <thumbnail src='./contents/assests/Vue.svg' size="100"/>
  </panel>
  <br/>
  <panel header="Example using icons" minimized>
    Some icons are not available in the libraries MarkBind supports! Please ensure that 
    the desired icons are available beofre choosing this option.
    <br/>
    <i class="fa-brands fa-square-js fa-2xl"></i>
    <i class="fa-brands fa-vuejs fa-2xl"></i>
  </panel>

</div>

---

## Navigating this site

This site comes pre-configured with the core <a href="https://markbind.org/userGuide/components/navigation.html#navigation-components" target="_blank">Navigation components</a>: a <tooltip content="Site Navigation">**siteNav**</tooltip>, a <tooltip content="Page Navigation">**pageNav**</tooltip>, a <tooltip content="Navigation Bar">**NavBar**</tooltip>, and a **Search Bar**. To help you get started with the **siteNav**, we have included <tooltip content="experience, skills, projects, project1, project2">five dummy placeholder pages</tooltip>. The **NavBar** also comes with a placeholder slot for your name.

---


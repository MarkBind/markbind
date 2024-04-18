1. One item
- Only 1 item 

1. One item with customization icon
- Only 1 item { icon="glyphicon-education" }

1. One item with once customization
- Only 1 item { icon="glyphicon-education" once=true }

1. One item with customization text
- Only 1 item { text="Step 1" }

1. One item with text-icons of lists
- item 1 { texts="['(a)','(b)','(c)']" }

1. One item + nested list
- Only 1 item
   - Only 1 item

1. One item + nested list with icon customization
- Only 1 item { icon="glyphicon-education" }
   - Only 1 item { icon="glyphicon-education" }

1. One item + nested list with once customization
- Only 1 item { icon="glyphicon-education" once=true }
   - Only 1 item { icon="glyphicon-education" once=true }

1. One item + nested list with text customization
- Only 1 item { text="Step 1" }
  - Only 1 item { text="Step 1.1" }

1. Text-icons of lists test
* item 1 { texts="['(a)','(b)','(c)']" }
* item 1
* item 1

1. Text-icons of lists outflow test
* item 1 { texts="['(a)','(b)','(c)']" }
* item 1
* item 1
* item 1

1. Text-icons of lists stop on override test
* item 1 { texts="['(a)','(b)','(c)','(d)']" }
* item 1
* item 1 { text="OVERRIDE" }
* item 1

1. Text-icons of lists does not stop on once override test
* item 1 { texts="['(a)','(b)','(c)','(d)']" }
* item 1
* item 1 { text="OVERRIDE" once=true}
* item 1

1. Text-icons of lists can use double escape to include quote test
* item 1 { texts="['\\'a\\'','\\'b\\'','\\'c\\'','\\'d\\'']" }
* item 1
* item 1
* item 1

1. Basic structure
* Item A
* Item B 
  * Sub-item B1 
  * Sub-item B2 
  * Sub-item B3 
    * Sub-sub-item B3.1
    * Sub-sub-item B3.2 
      * Sub-sub-sub-item B3.2.1
  * Sub-item B4 

1. Icon inheritance test
* Item A { icon="glyphicon-education" }
* Item B 
  * Sub-item B1 { icon="fas-file-code" }
  * Sub-item B2
  * Sub-item B3 
    * Sub-sub-item B3.1 { icon="./images/deer.jpg" i-width="50px" }
    * Sub-sub-item B3.2
      * Sub-sub-sub-item B3.2.1
  * Sub-item B4 

1. Text inheritance test
* Item A { text="First layer" }
* Item B
  * Sub-item B1 { text="Second layer" }
  * Sub-item B2
  * Sub-item B3
    * Sub-sub-item B3.1 { text="Third layer" }
    * Sub-sub-item B3.2
      * Sub-sub-sub-item B3.2.1
  * Sub-item B4

1. Text inheritance test with text-icons of lists
* Item A { texts="['11','12','13','14']" }
* Item B
  * Sub-item B1 { texts="['21','22','23','24']" }
  * Sub-item B2
  * Sub-item B3
    * Sub-sub-item B3.1 { texts="['31','32','33','34']" }
    * Sub-sub-item B3.2
      * Sub-sub-sub-item B3.2.1
  * Sub-item B4

1. First item no customization test
* Item A 
* Item B { icon="./images/deer.jpg" text="First"}
  * Sub-item B1
  * Sub-item B2 { icon="fas-file-code" text="Should not be appearing"}
  * Sub-item B3
    * Sub-sub-item B3.1
    * Sub-sub-item B3.2 { icon="./images/deer.jpg" i-width="50px" text="Should not be appearing"}
    * Sub-sub-sub-item B3.2.1
  * Sub-item B4

1. Correct first item customization test
* Item A { icon="glyphicon-education" }
* Item B { icon="./images/deer.jpg" }
  * Sub-item B1 { icon="fas-file-code" }
  * Sub-item B2 
  * Sub-item B3
    * Sub-sub-item B3.1 { icon="./images/deer.jpg" i-width="50px" }
    * Sub-sub-item B3.2 
      * Sub-sub-sub-item B3.2.1
  * Sub-item B4

1. Testing with various icon attributes
* Item A { icon="glyphicon-education" i-size="20px" i-class="text-primary" }
* Item B { icon="./images/deer.jpg" i-width="200px" i-height="100px" i-class="text-warning" }
  * Sub-item B1 { icon="fas-file-code" text="Hi" i-size="30px" }
  * Sub-item B2 { i-class="text-success" i-spacing="2rem" }
  * Sub-item B3
    * Sub-sub-item B3.1 { icon="./images/deer.jpg" i-width="50px" i-height="50px" }
    * Sub-sub-item B3.2 
      * Sub-sub-sub-item B3.2.1 { i-class="text-danger" }
  * Sub-item B4 { i-spacing="1rem" }

1. Testing with various text attributes
* Item A { text="Step 1" t-size="20px" t-class="text-primary" }
* Item B { text="Step 2" t-class="text-warning" }
  * Sub-item B1 { text="\_MD_" t-size="10px" }
  * Sub-item B2 { t-class="text-success" }
  * Sub-item B3
    * Sub-sub-item B3.1 { text=":+1:"}
    * Sub-sub-item B3.2
      * Sub-sub-sub-item B3.2.1 { t-class="text-danger" }
  * Sub-item B4

1. Mixing text and icon 
* Item A { text="Step 1" icon="glyphicon-education" t-size="20px" t-class="text-primary" }
* Item B { text="Step 2" t-class="text-warning" }
  * Sub-item B1 { text="\_MD_" icon="./images/deer.jpg" t-size="10px" i-width="20px" i-height="20px"}
  * Sub-item B2 { t-class="text-success" i-height="30px" i-width="30px"}
  * Sub-item B3
    * Sub-sub-item B3.1 { text=":+1:" icon="+1"}
    * Sub-sub-item B3.2
      * Sub-sub-sub-item B3.2.1 { t-class="text-danger" }
  * Sub-item B4

1. Mixing basic and customized lists
* Item A
* Item B 
  * Sub-item B1 {icon="fas-file-code" i-size="20px" i-class="text-success"}
  * Sub-item B2 
  * Sub-item B3 
    * Sub-sub-item B3.1 {icon="glyphicon-education" i-size="30px" i-class="text-danger"}
    * Sub-sub-item B3.2 
      * Sub-sub-sub-item B3.2.1 {icon="./images/deer.jpg" i-width="200px" i-height="100px" i-class="text-warning"}
  * Sub-item B4 

1. Reverse mixing basic and customized lists
* Item A {icon="glyphicon-education" i-size="20px" i-class="text-primary"}
* Item B 
  * Sub-item B1 
  * Sub-item B2
  * Sub-item B3
    * Sub-sub-item B3.1 
    * Sub-sub-item B3.2
      * Sub-sub-sub-item B3.2.1 
  * Sub-item B4

1. Every second list item customized
* Item A {icon="glyphicon-education" i-size="20px" i-class="text-primary"}
* Item B 
  * Sub-item B1 {icon="fas-file-code" i-size="30px" i-class="text-success"}
  * Sub-item B2 
  * Sub-item B3 {icon="./images/deer.jpg" i-width="200px" i-height="100px" i-class="text-warning"}
  * Sub-item B4

1. Once + none + customization
* Item A { icon="glyphicon-education" once=true }
* Item B 
  * Sub-item B1 { icon="fas-file-code" }
  * Sub-item B2
  * Sub-item B3 
    * Sub-sub-item B3.1 { icon="./images/deer.jpg" i-width="50px" }
    * Sub-sub-item B3.2
  * Sub-item B4 
* Item C { icon="fas-file-code" }

1. Customization + none + once
* Item A { icon="fas-file-code" }
* Item B
  * Sub-item B1 { icon="fas-file-code" }
  * Sub-item B2
  * Sub-item B3 
    * Sub-sub-item B3.1 { icon="./images/deer.jpg" i-width="50px" }
    * Sub-sub-item B3.2
  * Sub-item B4 
* Item C { icon="glyphicon-education" once=true }

1. Customization + once + none
* Item A { icon="fas-file-code" }
* Item B { icon="glyphicon-education" once=true }
  * Sub-item B1
  * Sub-item B2
  * Sub-item B3 
    * Sub-sub-item B3.1 { icon="./images/deer.jpg" i-width="50px" }
    * Sub-sub-item B3.2
  * Sub-item B4 
* Item C

1. Once + customization + none
* Item A { icon="glyphicon-education" once=true }
* Item B { icon="fas-file-code" }
  * Sub-item B1
  * Sub-item B2
  * Sub-item B3 
    * Sub-sub-item B3.1 { icon="./images/deer.jpg" i-width="50px" }
    * Sub-sub-item B3.2
  * Sub-item B4 
* Item C

1. None + customization + once
* Item A 
* Item B { icon="fas-file-code" }
  * Sub-item B1
  * Sub-item B2
  * Sub-item B3 
    * Sub-sub-item B3.1 { icon="./images/deer.jpg" i-width="50px" }
    * Sub-sub-item B3.2
  * Sub-item B4 
* Item C { icon="glyphicon-education" once=true }

1. None + once + customization
* Item A 
* Item B { icon="glyphicon-education" once=true }
  * Sub-item B1
  * Sub-item B2
  * Sub-item B3 
    * Sub-sub-item B3.1 { icon="./images/deer.jpg" i-width="50px" }
    * Sub-sub-item B3.2
  * Sub-item B4 
* Item C { icon="fas-file-code" }

1. Customization + once + customization
* Item A { icon="fas-file-code" }
* Item B { icon="glyphicon-education" once=true }
  * Sub-item B1
  * Sub-item B2
  * Sub-item B3 
    * Sub-sub-item B3.1 { icon="./images/deer.jpg" i-width="50px" }
    * Sub-sub-item B3.2
  * Sub-item B4 
* Item C { icon="./images/deer.jpg" i-width="50px" }

1. String once
* Item A { icon="glyphicon-education" once="true" }
* Item B 
  * Sub-item B1
  * Sub-item B2
  * Sub-item B3 
    * Sub-sub-item B3.1 { icon="./images/deer.jpg" i-width="50px" }
    * Sub-sub-item B3.2
  * Sub-item B4 
* Item C

1. False once for item A, rest of items will inherit
* Item A { icon="glyphicon-education" once=false }
* Item B 
  * Sub-item B1
  * Sub-item B2
  * Sub-item B3 
    * Sub-sub-item B3.1 { icon="./images/deer.jpg" i-width="50px" }
    * Sub-sub-item B3.2
  * Sub-item B4 
* Item C


1. False once for item B, will overwrite item A
* Item A { icon="fas-file-code" }
* Item B { icon="glyphicon-education" once=false }
  * Sub-item B1
  * Sub-item B2
  * Sub-item B3 
    * Sub-sub-item B3.1 { icon="./images/deer.jpg" i-width="50px" }
    * Sub-sub-item B3.2
  * Sub-item B4 
* Item C

1. Once for specific attributes besides icon, does not overwrite
* Item A { icon="glyphicon-education" i-size="70px" i-class="text-primary" }
* Item B { i-size="40px" once=true }
  * Sub-item B1
* Item C

1. False once for specific attributes besides icon, does overwrite
* Item A { icon="glyphicon-education" i-size="70px" i-class="text-primary" }
* Item B { i-size="40px" once=false }
  * Sub-item B1
* Item C

1. Sub-level
* Item A 
* Item B 
  * Sub-item B1 { icon="glyphicon-education" once=true }
  * Sub-item B2
  * Sub-item B3 { icon="fas-file-code" }
    * Sub-sub-item B3.1 { icon="./images/deer.jpg" i-width="50px" }
    * Sub-sub-item B3.2
  * Sub-item B4 
* Item C { icon="./images/deer.jpg" i-width="50px" }

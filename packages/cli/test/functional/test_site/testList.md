1. One item
- Only 1 item 

1. One item with customization
- Only 1 item { icon="glyphicon-education" }

1. One item with once customization
- Only 1 item { icon="glyphicon-education" once=true }

1. One item + nested list
- Only 1 item
   - Only 1 item

1. One item + nested list with customization
- Only 1 item { icon="glyphicon-education" }
   - Only 1 item { icon="glyphicon-education" }

1. One item + nested list with once customization
- Only 1 item { icon="glyphicon-education" once=true }
   - Only 1 item { icon="glyphicon-education" once=true }

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

1. First item no customization test
* Item A 
* Item B { icon="./images/deer.jpg" }
  * Sub-item B1
  * Sub-item B2 { icon="fas-file-code" }
  * Sub-item B3
    * Sub-sub-item B3.1
    * Sub-sub-item B3.2 { icon="./images/deer.jpg" i-width="50px" }
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

1. Testing with various attributes
* Item A { icon="glyphicon-education" i-size="20px" i-class="text-primary" }
* Item B { icon="./images/deer.jpg" i-width="200px" i-height="100px" i-class="text-warning" }
  * Sub-item B1 { icon="fas-file-code" i-size="30px" }
  * Sub-item B2 { i-class="text-success" i-spacing="2rem" }
  * Sub-item B3
    * Sub-sub-item B3.1 { icon="./images/deer.jpg" i-width="50px" i-height="50px" }
    * Sub-sub-item B3.2 
      * Sub-sub-sub-item B3.2.1 { i-class="text-danger" }
  * Sub-item B4 { i-spacing="1rem" }

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
* Item B { icon="glyphicon-education"  once=true }
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
* Item B { i-size="40px" once=true}
  * Sub-item B1
* Item C

1. False once for specific attributes besides icon, does overwrite
* Item A { icon="glyphicon-education" i-size="70px" i-class="text-primary" }
* Item B { i-size="40px" once=false}
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

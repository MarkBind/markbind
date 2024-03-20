1. One item
- Only 1 item 

1. One item with customization
- Only 1 item { icon="glyphicon-education" }

1. One item with one-off customization
- Only 1 item { icon="glyphicon-education" i-one-off=true }

1. One item + nested list
- Only 1 item
   - Only 1 item

1. One item + nested list with customization
- Only 1 item { icon="glyphicon-education" }
   - Only 1 item { icon="glyphicon-education" }

1. One item + nested list with one-off customization
- Only 1 item { icon="glyphicon-education" i-one-off=true }
   - Only 1 item { icon="glyphicon-education" i-one-off=true }

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
  * Sub-item B2 { i-class="text-success" }
  * Sub-item B3
    * Sub-sub-item B3.1 { icon="./images/deer.jpg" i-width="50px" i-height="50px" }
    * Sub-sub-item B3.2 
      * Sub-sub-sub-item B3.2.1 { i-class="text-danger" }
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

1. One-off + none + customization
* Item A { icon="glyphicon-education" i-one-off=true }
* Item B 
  * Sub-item B1 { icon="fas-file-code" }
  * Sub-item B2
  * Sub-item B3 
    * Sub-sub-item B3.1 { icon="./images/deer.jpg" i-width="50px" }
    * Sub-sub-item B3.2
  * Sub-item B4 
* Item C { icon="fas-file-code" }

1. Customization + none + one-off
* Item A { icon="fas-file-code" }
* Item B
  * Sub-item B1 { icon="fas-file-code" }
  * Sub-item B2
  * Sub-item B3 
    * Sub-sub-item B3.1 { icon="./images/deer.jpg" i-width="50px" }
    * Sub-sub-item B3.2
  * Sub-item B4 
* Item C { icon="glyphicon-education" i-one-off=true }

1. Customization + one-off + none
* Item A { icon="fas-file-code" }
* Item B { icon="glyphicon-education" i-one-off=true }
  * Sub-item B1
  * Sub-item B2
  * Sub-item B3 
    * Sub-sub-item B3.1 { icon="./images/deer.jpg" i-width="50px" }
    * Sub-sub-item B3.2
  * Sub-item B4 
* Item C

1. One-off + customization + none
* Item A { icon="glyphicon-education" i-one-off=true }
* Item B { icon="fas-file-code" }
  * Sub-item B1
  * Sub-item B2
  * Sub-item B3 
    * Sub-sub-item B3.1 { icon="./images/deer.jpg" i-width="50px" }
    * Sub-sub-item B3.2
  * Sub-item B4 
* Item C

1. None + customization + one-off
* Item A 
* Item B { icon="fas-file-code" }
  * Sub-item B1
  * Sub-item B2
  * Sub-item B3 
    * Sub-sub-item B3.1 { icon="./images/deer.jpg" i-width="50px" }
    * Sub-sub-item B3.2
  * Sub-item B4 
* Item C { icon="glyphicon-education" i-one-off=true }

1. None + one-off + customization
* Item A 
* Item B { icon="glyphicon-education"  i-one-off=true }
  * Sub-item B1
  * Sub-item B2
  * Sub-item B3 
    * Sub-sub-item B3.1 { icon="./images/deer.jpg" i-width="50px" }
    * Sub-sub-item B3.2
  * Sub-item B4 
* Item C { icon="fas-file-code" }

1. Customization + one-off + customization
* Item A { icon="fas-file-code" }
* Item B { icon="glyphicon-education" i-one-off=true }
  * Sub-item B1
  * Sub-item B2
  * Sub-item B3 
    * Sub-sub-item B3.1 { icon="./images/deer.jpg" i-width="50px" }
    * Sub-sub-item B3.2
  * Sub-item B4 
* Item C { icon="./images/deer.jpg" i-width="50px" }

1. One-off + customization + none with boolean one-off
* Item A { icon="glyphicon-education" i-one-off=true }
* Item B { icon="fas-file-code" }
  * Sub-item B1
  * Sub-item B2
  * Sub-item B3 
    * Sub-sub-item B3.1 { icon="./images/deer.jpg" i-width="50px" }
    * Sub-sub-item B3.2
  * Sub-item B4 
* Item C

1. False one-off
1. One-off + customization + none with boolean one-off
* Item A { icon="glyphicon-education" i-one-off=false }
* Item B 
  * Sub-item B1
  * Sub-item B2
  * Sub-item B3 
    * Sub-sub-item B3.1 { icon="./images/deer.jpg" i-width="50px" }
    * Sub-sub-item B3.2
  * Sub-item B4 
* Item C

1. Sub-level
* Item A 
* Item B 
  * Sub-item B1 { icon="glyphicon-education" i-one-off=true }
  * Sub-item B2
  * Sub-item B3 { icon="fas-file-code" }
    * Sub-sub-item B3.1 { icon="./images/deer.jpg" i-width="50px" }
    * Sub-sub-item B3.2
  * Sub-item B4 
* Item C { icon="./images/deer.jpg" i-width="50px" }

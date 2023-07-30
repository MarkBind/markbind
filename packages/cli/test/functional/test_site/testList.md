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

2. Icon inheritance test
* Item A { icon="glyphicon-education" }
* Item B 
  * Sub-item B1 { icon="fas-file-code" }
  * Sub-item B2
  * Sub-item B3 
    * Sub-sub-item B3.1 { icon="./images/deer.png" i-width="50px" }
    * Sub-sub-item B3.2
      * Sub-sub-sub-item B3.2.1
  * Sub-item B4 

3. First item no customization test
* Item A 
* Item B { icon="./images/deer.png" }
  * Sub-item B1
  * Sub-item B2 { icon="fas-file-code" }
  * Sub-item B3
    * Sub-sub-item B3.1
    * Sub-sub-item B3.2 { icon="./images/deer.png" i-width="50px" }
    * Sub-sub-sub-item B3.2.1
  * Sub-item B4

4. Correct first item customization test
* Item A { icon="glyphicon-education" }
* Item B { icon="./images/deer.png" }
  * Sub-item B1 { icon="fas-file-code" }
  * Sub-item B2 
  * Sub-item B3
    * Sub-sub-item B3.1 { icon="./images/deer.png" i-width="50px" }
    * Sub-sub-item B3.2 
      * Sub-sub-sub-item B3.2.1
  * Sub-item B4

5. Testing with various attributes
* Item A { icon="glyphicon-education" i-size="20px" i-class="text-primary" }
* Item B { icon="./images/deer.png" i-width="200px" i-height="100px" i-class="text-warning" }
  * Sub-item B1 { icon="fas-file-code" i-size="30px" }
  * Sub-item B2 { i-class="text-success" }
  * Sub-item B3
    * Sub-sub-item B3.1 { icon="./images/deer.png" i-width="50px" i-height="50px" }
    * Sub-sub-item B3.2 
      * Sub-sub-sub-item B3.2.1 { i-class="text-danger" }
  * Sub-item B4

6. Test for absence of icon
* Item A 
* Item B 
  * Sub-item B1 
  * Sub-item B2 
  * Sub-item B3 
    * Sub-sub-item B3.1
    * Sub-sub-item B3.2 
      * Sub-sub-sub-item B3.2.1
  * Sub-item B4


1. Mixing basic and customized lists
* Item A
* Item B 
  * Sub-item B1 {icon="fas-file-code" i-size="20px" i-class="text-success"}
  * Sub-item B2 
  * Sub-item B3 
    * Sub-sub-item B3.1 {icon="glyphicon-education" i-size="30px" i-class="text-danger"}
    * Sub-sub-item B3.2 
      * Sub-sub-sub-item B3.2.1 {icon="./images/deer.png" i-width="200px" i-height="100px" i-class="text-warning"}
  * Sub-item B4 

2. Reverse mixing basic and customized lists
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
  * Sub-item B3 {icon="./images/deer.png" i-width="200px" i-height="100px" i-class="text-warning"}
  * Sub-item B4

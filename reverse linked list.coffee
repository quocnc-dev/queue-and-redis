reverse linked list

1   =>  2   =>  3

curr = head -> curr = 1
prev = null

step1:
   next = curr.next -> next = 2
   curr.next = prev -> curr.next = null, curr = 1 -> 1.next = null
   prev = curr -> prev = 1, 1.next = null
   curr = next -> curr = 2 -> curr = 2, curr.next = 3

prev: null <- 1
curr: 2 -> 3

step2:
   next = curr.next -> next = 3
   curr.next = prev -> curr.next = 1 -> 2.next = 1
   prev = curr -> prev = 2, 2.next = 1
   curr = next -> curr = 3 -> 3.next = null

prev: null <- 1 <- 2
curr: 3 -> null

step3:
   next = curr.next -> next = null
   curr.next = prev -> curr.next = 2 -> 3.next = 2
   prev = curr -> prev = 3, 3.next = 2
   curr = next -> curr = null

prev: null <- 1 <- 2 <- 3
curr: null
return prev

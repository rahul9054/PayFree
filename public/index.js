const Form = document.querySelector('#Form');
const container = document.querySelector('.content');
const baseURL = 'https://localhost:7000';
var url = `/api/payment/order`;



Form.addEventListener('submit', (e) => {
    e.preventDefault(); 
  

    var params = {
      amount: Form.elements['Amount'].value,
      currency: "INR",
      receipt: "wthPayFree",
      payment_capture: '1'
  };
  
    
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function(res) {
      if (xmlHttp.readyState === 4) {
        res = JSON.parse(xmlHttp.responseText);
         var order_id = res.sub.id ;
         var key = res.key ; 
         var phone = Form.elements['Phone'].value ;
         var email = Form.elements['Email'].value ;
         checkout(order_id , key , phone , email) ;
    }
    }
    xmlHttp.open("POST", url, true);
    xmlHttp.setRequestHeader("Content-type", "application/json");
    xmlHttp.send(JSON.stringify(params));

  });

function checkout(order_id , key , phone , email){

  var options = {
    "key": key,
    "currency": "INR",
    "name": "PayFree",
    "description": "PayFree Transaction",
    "order_id": order_id,
    "handler": function(response) {
           var order_pay_id = response.razorpay_payment_id;
           var order_id = response.razorpay_order_id;
           var order_sig = response.razorpay_signature;

           verify(order_id , order_pay_id , order_sig) ;
    },
    "prefill": {
      "email": email,
      "contact": phone
  },
    "theme": {
        "color": "#0EB9F2"
    }
};
var rzp1 = new Razorpay(options);
rzp1.open();

}

function verify(order_id , order_pay_id , order_sig){

  var url = '/api/payment/verify';
  var params = {
    razorpay_order_id: order_id,
    razorpay_payment_id: order_pay_id,
    razorpay_signature: order_sig,
    name : Form.elements['Name'].value ,
    amount: Form.elements['Amount'].value,
    email : Form.elements['Email'].value ,
    phone : Form.elements['Phone'].value ,
    bankaccountno :  Form.elements['BankAccountNo'].value ,
};


  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function(res) {
      if (xmlHttp.readyState === 4) {
           res =  JSON.parse(xmlHttp.responseText);
         if(res.code == 200){
          //  container.style.display = 'none';
          Form.reset() ;
           swal("Payment Successful", "Your Transaction Is Successful", "success") ;
           }
          else{
            swal("Payment Failed", "Your Transaction Is Failed", "error") ;
       }
    }
  }
  xmlHttp.open("POST", url, true); 
  xmlHttp.setRequestHeader("Content-type", "application/json");
  xmlHttp.send(JSON.stringify(params));
}
  


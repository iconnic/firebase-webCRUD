/*--------------------------------------------------------------
# Global variables
--------------------------------------------------------------*/
var SAVE_LOCATION_IMG = "iconnicApps";
var SAVED_ID_CURRENT = "currentSavedId";
var SAVED_KEY_CURRENT = "currentSavedKey";
var SAVED_URL_CURRENT = "currentSavedUrl";

/*--------------------------------------------------------------
# FIREBASE
--------------------------------------------------------------*/

//Your web app's Firebase configuration
//REPLACE THIS WITH YOUR OWN DETAILS!!!!!!!!!!!!!!!!
var firebaseConfig = {
    apiKey: "?????",
    authDomain: "?????",
    databaseURL: "?????",
    projectId: "?????",
    storageBucket: "?????",
    messagingSenderId: "?????",
    appId: "??????"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

//Validate form and only submit once all feilds are entered
function validateForm(){
    var pName = document.getElementById("productName").value;
    var pDesc = document.getElementById("productDescription").value;
    var pPrice = document.getElementById("productPrice").value;
    
    if(pName == ""){
        document.getElementById("data").innerHTML = '<div class="alert alert-warning"><strong>Name Required!</strong> Please provide a product name</div>'
        return false;
    }else if(pDesc == ""){
        document.getElementById("data").innerHTML = '<div class="alert alert-warning"><strong>Description Required!</strong> Please fill out a product description</div>'
        return false;
    }else if(pPrice == ""){
        document.getElementById("data").innerHTML = '<div class="alert alert-warning"><strong>Price Required!</strong> Please provide a product price</div>'
        return false;
    }else if(isNaN(pPrice)){
        document.getElementById("data").innerHTML = '<div class="alert alert-warning"><strong>Please input a number value!</strong> Please provide a product price</div>'
        return false;
    }else if(validateImage('img1')){
        //show loading prompt
        document.getElementById("data").innerHTML = '<div class="spinner-border text-primary" role="status"><span>Saving...Please wait</span></div>';
            
        //upload image and if completed then upload the product data
        uploadImage('img1');
    }
}

//validate image
function validateImage(id){
    var formData = new FormData();
    var file = document.getElementById(id).files[0];
    
    if(typeof file === "undefined"){
        document.getElementById("data").innerHTML = '<div class="alert alert-warning"><strong>Select Image file!</strong> Please select a product image file.</div>'
        return false;
    }
    
    formData.append("Filedata",file);
    var ext = file.type.split('/').pop().toLowerCase();
    
    if(ext!="jpeg" && ext!="jpg"&& ext!="png" && ext!="bmp"){
        document.getElementById("data").innerHTML = '<div class="alert alert-warning"><strong>Select Valid Image file format!</strong> Please select a valid image file.</div>'
        return false;
    }else if(file.size>512000){
        document.getElementById("data").innerHTML = '<div class="alert alert-warning"><strong>File too large!</strong> Please select a product image. Max upload size is 0.5MB</div>'
        return false;
    }
    
    document.getElementById("data").innerHTML = "All inputs must be completed as required";
    return true;
}

//upload image to firebase storage and retreive reference
function uploadImage(id){
    var storage = firebase.storage();
    var file = document.getElementById(id).files[0];
    var storageref=storage.ref();
    var thisref=storageref.child(SAVE_LOCATION_IMG).child(file.name).put(file);
    
    thisref.on('state_changed',function(snapshot) {
    
    },function(error) {
        document.getElementById("data").innerHTML = '<div class="alert alert-warning"><strong>Upload Error!</strong> Sorry, something went wrong. Please try again later...</div>'
    }, function(){
        // Uploaded completed successfully, now we can get the download URL
        thisref.snapshot.ref.getDownloadURL().then(function(downloadURL) {
            //getting url of image and save product data       
            
            saveProduct(downloadURL)
        });
    });
} 

//SAVE PRODUCT AND GENERATE UNIQUE ID/LOCATION
function saveProduct(imgUrl){
    //document.getElementById("data").innerHTML = "done1 start!";

    //use 'set' to save to ref location and 'push' to generate unique id and save under that id location
    //push will create a new object and set will overwrite any object in the location if it exists
    
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date+' '+time;
    
    var productId = ""+Date.now()+Math.floor(Math.random()*100);

    //var newProductRef = firebase.database().ref("iconnicApps/product").set({
    var newProductRef = firebase.database().ref("iconnicApps/product").push({
        productId: productId,
        productName: document.getElementById("productName").value,
        productDescription: document.getElementById("productDescription").value,
        productCategory: document.getElementById("productCategory").value,
        productPrice: document.getElementById("productPrice").value,
        productDateCreated: date,
        productTimeCreated: time,
        productImageUrl: imgUrl
    }).then(function(){
      //alert("Success");
        //Get the unique ID generated by push() by accessing its key
        var productID = newProductRef.key;

        initializeInputs();
        document.getElementById("data").innerHTML = '<div class="alert alert-success"><strong>Product Saved!</strong> Create a new product below</div>';
    }).catch(function(error) {
      //alert("Failed: " + error);
    });
}

function getProductsData(){
//use 'on' for continous monitoring and data changes and 'once' for local refence once data is loaded

    var arrayProducts = [];
    
    //firebase.database().ref('iconnicApps/product').on('value', (snapshot) => {
    firebase.database().ref('iconnicApps/product').limitToFirst(16).once('value', (snapshot) => {
        snapshot.forEach(function(childSnapshot){
            var childKey = childSnapshot.key;
            var childData = childSnapshot.val();

            var productCurrent = new product(JSON.stringify(childData['productId']), JSON.stringify(childData['productName']), JSON.stringify(childData['productDescription']), JSON.stringify(childData['productCategory']), JSON.stringify(childData['productPrice']), JSON.stringify(childData['productDateCreated']), JSON.stringify(childData['productTimeCreated']),
            JSON.stringify(childData['productImageUrl']));

            arrayProducts.push(productCurrent);

            //document.getElementById("loadArea").innerHTML = '<div class="alert alert-info"><strong>Load Complete!</strong> Data is:'+JSON.stringify(childData)+'</div>'
            //document.getElementById("data").innerHTML = JSON.stringify(childData['productName']);
        });                       
    }).then(function(){
        //console.log("Successful");
        //run this after all products loaded and not in the loop!!!!!
        displayProductList(arrayProducts);
    }).catch(function(error) {
        //console.log("Failed: "+error);
        document.getElementById("data").innerHTML = '<div class="alert alert-warning"><strong>Ooops!</strong> Load error. Something went wrong. Please try again</div>'
    });
}

function product(id, name, description, category, price ,dateCreated, timeCreated, imageUrl) {
    this.id = id;
    this.name = name; 
    this.description  = description;
    this.category = category;
    this.price = price;
    this.dateCreated = dateCreated;
    this.timeCreated = timeCreated;
    this.imageUrl = imageUrl
}

function displayProductList(arrayProducts){
    var cover1 = '<div class="row my-3 py-2">';
    var cover2 = '</div>';
    var simpleCard1 = '<div class="col-lg-3 col-md-6 mb-4 mb-lg-0"><div class="card rounded shadow-sm border-0" data-aos="fade-up" data-aos-delay="';
    var simpleCard2 = '<div class="card-body p-4"><img src=';
    var simpleCard3 = ' alt="" class="img-fluid d-block mx-auto mb-3"><h5><a href="#" onclick="';
    var simpleCard4 = '" class="text-dark">';
    var simpleCard5 = '</a></h5><p class="small text-muted font-italic">';
    var simpleCard6 = '</p><br></div></div></div>';
    
    //var plainCard1 = '<div class="col-lg-3 col-md-6 mb-4 mb-lg-0"><div class="card rounded border-0 shadow-sm" data-aos="fade-up" data-aos-delay="200"><div class="embed-responsive .embed-responsive-1by1"><img class="card-img-top img-fluid" src="https://via.placeholder.com/180/#f2f2f2/FFFFFF/?text=IconnicApps" alt="Card image cap"></div><div class="card-body"><h5><a href="#" onclick="" class="text-dark">This will be the title</a></h5><p class="card-text">Some quick example text to build on the card title and make up the bulk of the card\'s content.</p><p class="small">ZMW 999.99</p></div></div></div>'
    
    //var simpleCard1 = '<div class="col-lg-3 col-md-6 mb-4 mb-lg-0"><div class="card rounded shadow-sm border-0" data-aos="fade-up" data-aos-delay="';
    //var simpleCard2 = '<div class="card-body p-4 embed-responsive embed-responsive-16by9"><img src=';
    //var simpleCard3 = ' alt="" class="img-fluid d-block mx-auto mb-3 embed-responsive-item"><h5><a href="';
    //var simpleCard4 = '" class="text-dark">';
    //var simpleCard5 = '</a></h5><p class="small text-muted font-italic">';
    //var simpleCard6 = '</p></div></div></div>';
    
    var output = "";
    var count = 0;
    var delay = 150;
    
    for (i=0; i<arrayProducts.length; i++) {
        var cleanProductId = arrayProducts[i].id.replaceAll('"','');
        
        if(count===0){output=output+cover1;}
        
        output = output+simpleCard1+delay+'">'+simpleCard2+arrayProducts[i].imageUrl+simpleCard3+'loadSingleProduct('+cleanProductId+'); return false;'+simpleCard4+arrayProducts[i].name+simpleCard5+arrayProducts[i].description+simpleCard6;
        
        //output=output+plainCard1;
        
        delay=delay+150;
        
        if(count===3){output=output+cover2;}
        count++; if(count>=4){count=0;}
        
        //console.log(output);
    }
    
    output=output+cover2;
    //console.log(output);
    
    document.getElementById("loadArea").innerHTML = output;
    
}

function initializeInputs(){
    document.getElementById("productName").value = "";
    document.getElementById("productDescription").value = "";
    document.getElementById("productPrice").value = "";
    document.getElementById("productCategory").value = "0";
    document.getElementById("data").innerHTML = "All inputs must be completed as required";
    document.getElementById("loadArea").innerHTML = "";
}
            
/*--------------------------------------------------------------
# Page Functions
--------------------------------------------------------------*/

//loading a single product thats been clicked
function loadSingleProduct(productId){
    //console.log(productId);
    
    //save the value
    if(typeof(Storage)!=="undefined"){
        localStorage.setItem(SAVED_ID_CURRENT,productId);
        //redirect to the new page
        //use the id to load the single product
        window.location.href = 'edit.html';
    }else{
        document.getElementById("loadArea").innerHTML = '<div class="alert alert-info"><strong>Ooops!</strong> Looks like your browser is not compatible for this operation</div>'
    }
}

function loadSingleProductData(){
    if(typeof(Storage)!=="undefined"){
        var id = localStorage.getItem(SAVED_ID_CURRENT);
        var arrayProducts = [];
        
        //load single product using firebase
        firebase.database().ref('iconnicApps/product').orderByChild('productId').equalTo(id).limitToFirst(1).once('value', (snapshot) => {
        snapshot.forEach(function(childSnapshot){
            var childKey = childSnapshot.key;
            var childData = childSnapshot.val();

            var productCurrent = new product(JSON.stringify(childData['productId']), JSON.stringify(childData['productName']), JSON.stringify(childData['productDescription']), JSON.stringify(childData['productCategory']), JSON.stringify(childData['productPrice']), JSON.stringify(childData['productDateCreated']), JSON.stringify(childData['productTimeCreated']),
            JSON.stringify(childData['productImageUrl']));

            arrayProducts.push(productCurrent);
            
            localStorage.setItem(SAVED_KEY_CURRENT,childKey);
            localStorage.setItem(SAVED_URL_CURRENT, JSON.stringify(childData['productImageUrl']));
            //console.log(childKey);
        });                       

    }).then(function(){
        //console.log("Successful");
        //load the product values onto the page
        displaySingleProduct(arrayProducts);
    }).catch(function(error) {
        //console.log("Failed: "+error);
        document.getElementById("data").innerHTML = '<div class="alert alert-warning"><strong>Ooops!</strong> Load error. Something went wrong. Please try again</div>'
    });
    }else{
        document.getElementById("data").innerHTML = '<div class="alert alert-info"><strong>Ooops!</strong> Looks like your browser is not compatible for this operation</div>'
    }
}

function deleteSingleProduct(){
    if(typeof(Storage)!=="undefined"){
        var id = localStorage.getItem(SAVED_ID_CURRENT);
        var key = localStorage.getItem(SAVED_KEY_CURRENT);
        
         firebase.database().ref('iconnicApps/product').child(key).remove().then(function(){
             console.log("Successful Deletion");
             window.location.href = 'view_all.html';
         }).catch(function(error){
            console.log("FAILED: "+error.message); 
         });    
        
    }else{
        document.getElementById("data").innerHTML = '<div class="alert alert-info"><strong>Ooops!</strong> Looks like your browser is not compatible for this operation</div>'
    }
}

function displaySingleProduct(arrayProducts){
    document.getElementById("productName").value = arrayProducts[0].name.replaceAll('"','');
    document.getElementById("productDescription").value = arrayProducts[0].description.replaceAll('"','');
    document.getElementById("productPrice").value = arrayProducts[0].price.replaceAll('"','');
    
    var cleanProductCategory = Number(arrayProducts[0].category.replaceAll('"',''));
    
    document.getElementById("productCategory").value = cleanProductCategory;
    console.log(cleanProductCategory);
    
    document.getElementById("data").innerHTML = '<div class="alert alert-warning"><strong>READY FOR EDITING!</strong> Updating will overwrite this products information</div>'
}

function updateSingleProduct(){
    if(typeof(Storage)!=="undefined"){
        //use the same imageurl because we havent implemented an image update yet :/
        var imgUrl = localStorage.getItem(SAVED_URL_CURRENT).replaceAll('"','');
        var productId = localStorage.getItem(SAVED_ID_CURRENT);
        var productKey = localStorage.getItem(SAVED_KEY_CURRENT);
        
        var today = new Date();
        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

        var updateProductRef = firebase.database().ref("iconnicApps/product").child(productKey).update({
            productId: productId,
            productName: document.getElementById("productName").value,
            productDescription: document.getElementById("productDescription").value,
            productCategory: document.getElementById("productCategory").value,
            productPrice: document.getElementById("productPrice").value,
            productDateCreated: date,
            productTimeCreated: time,
            productImageUrl: imgUrl
        }).then(function(){
          //alert("Data saved successfully.");
            console.log("Successful Update");
            window.location.href = 'view_all.html';
        }).catch(function(error) {
          //alert("Data could not be saved." + error);
            document.getElementById("data").innerHTML = '<div class="alert alert-warning"><strong>Ooops!</strong> Updating error. Something went wrong. Please try again</div>'
        });
        
    }else{
        document.getElementById("data").innerHTML = '<div class="alert alert-info"><strong>Ooops!</strong> Looks like your browser is not compatible for this operation</div>'
    }
}

//filter product by chosen filter
function loadProductsByFilter(filter){
    var arrayProducts = [];
    firebase.database().ref('iconnicApps/product').orderByChild('productCategory').equalTo(filter).limitToFirst(16).once('value', (snapshot) => {
        snapshot.forEach(function(childSnapshot){
            var childKey = childSnapshot.key;
            var childData = childSnapshot.val();

            var productCurrent = new product(JSON.stringify(childData['productId']), JSON.stringify(childData['productName']), JSON.stringify(childData['productDescription']), JSON.stringify(childData['productCategory']), JSON.stringify(childData['productPrice']), JSON.stringify(childData['productDateCreated']), JSON.stringify(childData['productTimeCreated']),
            JSON.stringify(childData['productImageUrl']));

            arrayProducts.push(productCurrent);

            //document.getElementById("loadArea").innerHTML = '<div class="alert alert-info"><strong>Load Complete!</strong> Data is:'+JSON.stringify(childData)+'</div>'
            //document.getElementById("data").innerHTML = JSON.stringify(childData['productName']);
        });                      
    }).then(function(){
        //console.log("Successful");
        //run this after all products loaded and not in the loop!!!!!
        displayProductList(arrayProducts);
    }).catch(function(error) {
        //console.log("Failed: "+error);
        document.getElementById("data").innerHTML = '<div class="alert alert-warning"><strong>Ooops!</strong> Load error. Something went wrong. Please try again</div>'
    });
}

/*--------------------------------------------------------------
# NavBar
--------------------------------------------------------------*/

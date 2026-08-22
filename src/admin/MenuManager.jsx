import React, {useEffect, useState} from "react";
import {api} from "../api/client.js";
import DishForm from "./DishForm.jsx";
import "./MenuManager.css";


export default function MenuManager({refreshDishes, categories = []}){


const [dishes,setDishes]=useState([]);
const [loading,setLoading]=useState(true);
const [showForm,setShowForm]=useState(false);



const loadMenu = async()=>{

const data = await api.getDishes(true);


if(data){

setDishes(data);

}

setLoading(false);

}



useEffect(()=>{

loadMenu();

},[]);





// HIDE / SHOW FOOD

const toggleFood = async(dish)=>{


await api.toggleAvailability(
dish.id,
!dish.available
);


// reload admin list

loadMenu();


// reload customer home

if(refreshDishes){

refreshDishes();

}


};





// CHANGE PRICE

const changePrice = async(dish)=>{


const newPrice =
prompt(
"Enter new price",
dish.price
);



if(!newPrice) return;



await api.updateDish(

dish.id,

{

price:Number(newPrice)

}

);



loadMenu();



if(refreshDishes)
refreshDishes();



};

const handleDelete = async(id)=>{


const confirmDelete =
window.confirm(
"Are you sure you want to delete this food?"
);


if(!confirmDelete) return;


try{


await api.deleteDish(id);


// refresh list

setDishes(prev =>
prev.filter(
dish=>dish.id !== id
)
);


}catch(error){

console.error(error);

alert("Delete failed");

}


};





// CHANGE IMAGE


const changeImage = async(dish)=>{


const image =
prompt(
"Paste image URL",
dish.image
);



if(!image) return;



await api.updateDish(

dish.id,

{

image_url:image

}

);



loadMenu();



if(refreshDishes)
refreshDishes();



};







if(loading){

return <h2>Loading menu...</h2>

}






return(

<div className="menu-manager">


<h2>
Restaurant Menu
</h2>

<button
className="add-food-button"
onClick={()=>setShowForm(true)}
>
+ Add Food
</button>

{
showForm &&
<DishForm

categories={categories}

onClose={()=>
setShowForm(false)
}

onSaved={()=>
loadMenu()
}

/>
}

<div className="menu-grid">



{

dishes.map(dish=>(


<div 
className="menu-card"
key={dish.id}
>
<button
className="delete-btn"
onClick={()=>handleDelete(dish.id)}
>
🗑 Delete
</button>


<img

src={dish.image}

alt={dish.name}

/>



<h3>
{dish.name}
</h3>



<p>
Price: {dish.price} ETB
</p>



<p>

Status:

{

dish.available ?

<span style={{color:"green"}}>
Available
</span>

:

<span style={{color:"red"}}>
Hidden
</span>

}


</p>




<button

onClick={()=>changePrice(dish)}

>

💰 Change Price

</button>




<button

onClick={()=>changeImage(dish)}

>

🖼 Change Image

</button>




<button

onClick={()=>toggleFood(dish)}

>

{

dish.available ?

"Hide Food"

:

"Show Food"

}


</button>




</div>



))

}


</div>


</div>


)


}
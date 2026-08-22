import React,{useState} from 'react'

import './AdminLayout.css'



const NAV_ITEMS=[

{
id:'dashboard',
label:'Dashboard',
icon:'📊'
},


{
id:'menu',
label:'Menu',
icon:'🍽️'
}


]




export default function AdminLayout({

connected,
onExit,
children,
activePage,
onNavigate

}){


const [sidebarOpen,setSidebarOpen]=useState(false)



return (

<div className="admin-layout">



<aside
className={
`admin-sidebar 
${sidebarOpen?'admin-sidebar--open':''}`
}
>



<div className="admin-sidebar__header">


<span>

</span>


<div>

<h2>
Habesha Bites
</h2>


<p>
Admin Panel
</p>


</div>


</div>





<nav className="admin-sidebar__nav">


{

NAV_ITEMS.map(item=>(


<button

key={item.id}

className={
activePage===item.id
?
'admin-nav-item admin-nav-item--active'
:
'admin-nav-item'
}


onClick={()=>{
console.log("clicked:", item.id)
onNavigate(item.id)

setSidebarOpen(false)

}}

>


<span>
{item.icon}
</span>


{item.label}


</button>


))

}



</nav>






<div className="admin-sidebar__footer">


<p>

{
connected
?
'🟢 MySQL Connected'
:
'🔴 Offline'
}

</p>



<button

onClick={onExit}

>

← Exit App

</button>


</div>





</aside>







<div className="admin-main">



<header className="admin-main__header">


<button

onClick={()=>
setSidebarOpen(!sidebarOpen)
}

>

☰

</button>



<h1>

{
NAV_ITEMS.find(
n=>n.id===activePage
)?.label
}

</h1>



</header>





<div className="admin-main__content">

{children}

</div>





</div>





</div>


)


}
import {
FiTruck,
FiShield,
FiCreditCard,
FiGift
} from "react-icons/fi";

import "./Benefits.css";


const Benefits = () => {

return (

<section className="benefits">

<div className="benefit">

<FiTruck/>

<div>
<h4>
Envíos a todo el país
</h4>

<p>
Recibí tu compra donde estés.
</p>
</div>

</div>



<div className="benefit">

<FiCreditCard/>

<div>
<h4>
Hasta 6 cuotas sin interés
</h4>

<p>
Pagá de forma simple y segura.
</p>
</div>

</div>



<div className="benefit">

<FiShield/>

<div>
<h4>
Compra segura
</h4>

<p>
Tus datos protegidos.
</p>
</div>

</div>



<div className="benefit">

<FiGift/>

<div>
<h4>
Ofertas exclusivas
</h4>

<p>
Productos seleccionados.
</p>
</div>

</div>


</section>

);

};


export default Benefits;
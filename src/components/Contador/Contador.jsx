import { useState } from "react";
import { FiMinus, FiPlus } from "react-icons/fi";

import "./Contador.css";


const Contador = ({ initial, stock, onCountChange }) => {
    const [count, setCount] = useState(initial);


    const handleIncrement = () => {
        if (count < stock) {
            const newCount = count + 1;
            setCount(newCount);
            onCountChange(newCount);
        }
    };


    const handleDecrement = () => {
        if (count > 1) {
            const newCount = count - 1;
            setCount(newCount);
            onCountChange(newCount);
        }
    };


    return (
        <div className="contador-container">
            <button
                type="button"
                className="btn-modify"
                onClick={handleDecrement}
                disabled={count <= 1}
                aria-label="Restar una unidad"
            >
                <FiMinus />
            </button>

            <span className="count-value" aria-live="polite">
                {count}
            </span>

            <button
                type="button"
                className="btn-modify"
                onClick={handleIncrement}
                disabled={count >= stock}
                aria-label="Sumar una unidad"
            >
                <FiPlus />
            </button>
        </div>
    );
};


export default Contador;
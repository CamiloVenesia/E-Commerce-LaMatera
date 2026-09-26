import "./CategoryHeader.css";

const CategoryHeader = ({ categoria }) => {

    const data = {
        mates:{
            title:"Mates",
            text:"Diseños artesanales seleccionados para acompañar tus mejores momentos."
        },
        termos:{
            title:"Termos",
            text:"Mantienen la temperatura ideal para disfrutar donde estés."
        },
        accesorios:{
            title:"Accesorios",
            text:"Todo lo necesario para completar tu equipo matero."
        }
    };

    const info = data[categoria] || {
        title:"Todos los productos",
        text:"Descubrí nuestra selección de mates, termos y accesorios."
    };

    return(
        <section className="category-header">

            <span>
                Catálogo
            </span>

            <h1>
                {info.title}
            </h1>

            <p>
                {info.text}
            </p>

        </section>
    );
};

export default CategoryHeader;
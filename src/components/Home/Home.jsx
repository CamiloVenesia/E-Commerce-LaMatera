import "./Home.css";

import Hero from "./Hero/Hero";
import Benefits from "./Benefits/Benefits";
import Categories from "./Categories/Categories";
import FeaturedProducts from "./FeaturedProducts/FeaturedProducts";
import BrandBanner from "./BrandBanner/BrandBanner";
import Ritual from "./Ritual/Ritual";
import Newsletter from "./Newsletter/Newsletter";


const Home = () => {

    return (

        <main className="home">

            <Hero />

            <Benefits />

            <Categories />

            <FeaturedProducts />

            <BrandBanner />

            <Ritual />

            <Newsletter />

        </main>

    );

};


export default Home;
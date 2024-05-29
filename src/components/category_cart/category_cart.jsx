import "./category_cart.css";
import Image from "next/image";
import { useRouter } from "next/navigation";
export default function CategoryCart({ category, userID }) {
  const router = useRouter();
  function handleCategoryClick() {
    router.push(
      `/homepage/${encodeURIComponent(userID)}/category/${category.category_id}`
    );
  }
  return (
    <button className="category-cart" onClick={handleCategoryClick}>
      <div className="category-cart-image">
        <Image src={category.img} fill="true" />
      </div>
      <div className="category-cart__info">
        <h3>{category.name}</h3>
      </div>
    </button>
  );
}

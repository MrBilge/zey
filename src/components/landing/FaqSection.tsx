import FaqItem from "./FaqItem";

const frequentlyAskedQuestions = [
  {
    question: "Zeytinyağını nasıl saklamalıyım?",
    answer:
      "Şişenizi doğrudan güneş ışığından ve ısı kaynaklarından uzak, serin ve karanlık bir yerde saklayın. Kullandıktan sonra kapağını sıkıca kapatın.",
  },
  {
    question: "Zeytinyağını hangi yemeklerde kullanabilirim?",
    answer:
      "Salatalarda, kahvaltıda, sebze yemeklerinde ve sevdiğiniz pek çok tarifte kullanabilirsiniz. Sofrada ekmeğinize eşlik etmesi bile yeterli.",
  },
  {
    question: "Nasıl sipariş verebilirim?",
    answer:
      "Satış hazırlıklarımız sürüyor. Ürünler, fiyatlar, teslimat ve sipariş seçenekleri hazır olduğunda bu sayfada yer alacak.",
  },
];

export default function FaqSection() {
  return (
    <section id="sorular" className="wrap section faq">
      <div>
        <div className="eyebrow">AKLINIZDA KALMASIN</div>
        <h2>Biraz da<br /><em>zey’den konuşalım.</em></h2>
      </div>
      <div className="questions">
        {frequentlyAskedQuestions.map(({ question, answer }) => (
          <FaqItem key={question} question={question} answer={answer} />
        ))}
      </div>
    </section>
  );
}

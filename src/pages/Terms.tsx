import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const Terms = () => {
  const navigate = useNavigate();
  return (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-24 pb-16 px-4 max-w-5xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Powrót
      </button>
      <div
        style={{ background: '#fff', borderRadius: 12, padding: '2em' }}
        dangerouslySetInnerHTML={{
          __html: `
<table style="width:85%;border-collapse:collapse;margin-left:auto;margin-right:auto;font-family:sans-serif;font-size:12pt;">

  <!-- NAGŁÓWEK -->
  <tr style="border:1px solid #ccc;">
    <th colspan="2" style="border:1px solid #ccc;padding:8px;padding-top:20px;font-size:18px;line-height:40px;background-color:#f5f5f5;color:#000;text-align:center;">
      Regulamin strony internetowej<br>
      Perceply PL („Regulamin")<br>
      <small style="font-size:14px;font-weight:normal;">Dokument z dnia: 18.06.2026</small>
    </th>
  </tr>

  <!-- DEFINICJE -->
  <tr style="border:1px solid #ccc;">
    <td rowspan="2" style="border:1px solid #ccc;padding:8px;width:200px;max-width:200px;text-align:center;vertical-align:top;background-color:#fff;color:#2f5496;padding-top:40px;">
      <svg width="60" height="60" stroke-width="1.5" viewBox="0 0 24 24" fill="#FFFFFF" color="#2f5496"><path fill="#FFFFFF" d="M12 21V7C12 5.89543 12.8954 5 14 5H21.4C21.7314 5 22 5.26863 22 5.6V18.7143" stroke="#2f5496" stroke-width="1.5" stroke-linecap="round"></path><path fill="#FFFFFF" d="M12 21V7C12 5.89543 11.1046 5 10 5H2.6C2.26863 5 2 5.26863 2 5.6V18.7143" stroke="#2f5496" stroke-width="1.5" stroke-linecap="round"></path><path fill="#FFFFFF" d="M14 19L22 19" stroke="#2f5496" stroke-width="1.5" stroke-linecap="round"></path><path fill="#FFFFFF" d="M10 19L2 19" stroke="#2f5496" stroke-width="1.5" stroke-linecap="round"></path><path fill="#FFFFFF" d="M12 21C12 19.8954 12.8954 19 14 19" stroke="#2f5496" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#FFFFFF" d="M12 21C12 19.8954 11.1046 19 10 19" stroke="#2f5496" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
    </td>
    <td style="border:1px solid #ccc;padding:8px;text-align:center;font-weight:bold;text-transform:uppercase;font-size:18px;line-height:20px;background-color:#9ab5e0;color:#000;">DEFINICJE</td>
  </tr>
  <tr style="border:1px solid #ccc;">
    <td style="border:1px solid #ccc;padding:8px;text-align:left;font-size:14px;line-height:200%;padding-bottom:40px;background-color:#fff;color:#000;">
      <p><strong>Strona internetowa</strong></p>
      <p>Serwis internetowy <strong>Perceply PL</strong>, dostępny pod adresem <strong><a href="https://www.bitbrew.pl" target="_blank" rel="noopener noreferrer">www.bitbrew.pl</a></strong>, prowadzony przez Usługodawcę.</p>
      <p><strong>Usługodawca</strong></p>
      <p>Patryk Rybacki<br>działalność nierejestrowana<br>Biskupia 7/2</p>
      <p>Kiedy w Regulaminie użyte są takie zwroty jak „my", „nasz", „nami" itp. należy przez to rozumieć Usługodawcę.</p>
      <p><strong>Usługobiorca</strong></p>
      <p>Każdy podmiot korzystający ze Strony internetowej, w tym z usług na niej dostępnych.</p>
      <p><strong>Konsument</strong></p>
      <p>Usługobiorca będący osobą fizyczną, korzystający ze Strony internetowej bez bezpośredniego związku z jego działalnością gospodarczą lub zawodową.</p>
      <p><strong>Przedsiębiorca uprzywilejowany</strong></p>
      <p>Usługobiorca, który jest osobą fizyczną zawierającą na podstawie Regulaminu umowę (lub podejmującą czynności zmierzające do zawarcia tej umowy), bezpośrednio związaną z jej działalnością gospodarczą, ale nieposiadającą dla niej charakteru zawodowego.</p>
      <p><strong>Usługobiorca uprzywilejowany</strong></p>
      <p>Usługobiorca, który jest Konsumentem lub Przedsiębiorcą uprzywilejowanym.</p>
    </td>
  </tr>

  <!-- PUNKT KONTAKTOWY -->
  <tr style="border:1px solid #ccc;">
    <td rowspan="2" style="border:1px solid #ccc;padding:8px;width:200px;max-width:200px;text-align:center;vertical-align:top;background-color:#fff;color:#2f5496;padding-top:40px;">
      <svg width="60" height="60" stroke-width="1.5" viewBox="0 0 24 24" fill="#FFFFFF" color="#2f5496"><path fill="#FFFFFF" d="M7 9L12 12.5L17 9" stroke="#2f5496" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#FFFFFF" d="M2 17V7C2 5.89543 2.89543 5 4 5H20C21.1046 5 22 5.89543 22 7V17C22 18.1046 21.1046 19 20 19H4C2.89543 19 2 18.1046 2 17Z" stroke="#2f5496" stroke-width="1.5"></path></svg>
    </td>
    <td style="border:1px solid #ccc;padding:8px;text-align:center;font-weight:bold;text-transform:uppercase;font-size:18px;line-height:20px;background-color:#9ab5e0;color:#000;">PUNKT KONTAKTOWY</td>
  </tr>
  <tr style="border:1px solid #ccc;">
    <td style="border:1px solid #ccc;padding:8px;text-align:left;font-size:14px;line-height:200%;padding-bottom:40px;background-color:#fff;color:#000;">
      <p>W celu kontaktowania się z nami możesz skorzystać z następujących form komunikacji elektronicznej:</p>
      <ul>
        <li>poczta elektroniczna: <strong>kontakt@perceply.pl</strong></li>
        <li>formularz kontaktowy dostępny pod adresem: <strong><a href="https://www.bitbrew.pl" target="_blank" rel="noopener noreferrer">https://www.bitbrew.pl</a></strong></li>
      </ul>
    </td>
  </tr>

  <!-- JĘZYK KOMUNIKACJI -->
  <tr style="border:1px solid #ccc;">
    <td rowspan="2" style="border:1px solid #ccc;padding:8px;width:200px;max-width:200px;text-align:center;vertical-align:top;background-color:#fff;color:#2f5496;padding-top:40px;">
      <svg width="60" height="60" stroke-width="1.5" viewBox="0 0 24 24" fill="#FFFFFF" color="#2f5496"><path fill="#FFFFFF" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#2f5496" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#FFFFFF" d="M2.5 12.5L8 14.5L7 18L8 21" stroke="#2f5496" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#FFFFFF" d="M17 20.5L16.5 18L14 17V13.5L17 12.5L21.5 13" stroke="#2f5496" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#FFFFFF" d="M19 5.5L18.5 7L15 7.5V10.5L17.5 9.5H19.5L21.5 10.5" stroke="#2f5496" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#FFFFFF" d="M2.5 10.5L5 8.5L7.5 8L9.5 5L8.5 3" stroke="#2f5496" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
    </td>
    <td style="border:1px solid #ccc;padding:8px;text-align:center;font-weight:bold;text-transform:uppercase;font-size:18px;line-height:20px;background-color:#9ab5e0;color:#000;">JĘZYK KOMUNIKACJI</td>
  </tr>
  <tr style="border:1px solid #ccc;">
    <td style="border:1px solid #ccc;padding:8px;text-align:left;font-size:14px;line-height:200%;padding-bottom:40px;background-color:#fff;color:#000;">
      <p>Możesz skontaktować się z nami w następujących językach:</p>
      <ul>
        <li>polski,</li>
        <li>angielski,</li>
        <li>francuski,</li>
        <li>hiszpański,</li>
        <li>niemiecki,</li>
        <li>włoski.</li>
      </ul>
    </td>
  </tr>

  <!-- WARUNKI TECHNICZNE -->
  <tr style="border:1px solid #ccc;">
    <td rowspan="2" style="border:1px solid #ccc;padding:8px;width:200px;max-width:200px;text-align:center;vertical-align:top;background-color:#fff;color:#2f5496;padding-top:40px;">
      <svg width="60" height="60" viewBox="0 0 24 24" stroke-width="1.5" fill="#FFFFFF" color="#2f5496"><path fill="#FFFFFF" d="M3.2 14.2222V4C3.2 2.89543 4.09543 2 5.2 2H18.8C19.9046 2 20.8 2.89543 20.8 4V14.2222M3.2 14.2222H20.8M3.2 14.2222L1.71969 19.4556C1.35863 20.7321 2.31762 22 3.64418 22H20.3558C21.6824 22 22.6414 20.7321 22.2803 19.4556L20.8 14.2222" stroke="#2f5496" stroke-width="1.5"></path><path fill="#FFFFFF" d="M11 19L13 19" stroke="#2f5496" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#FFFFFF" d="M14 6L16 8L14 10" stroke="#2f5496" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#FFFFFF" d="M10 6L8 8L10 10" stroke="#2f5496" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
    </td>
    <td style="border:1px solid #ccc;padding:8px;text-align:center;font-weight:bold;text-transform:uppercase;font-size:18px;line-height:20px;background-color:#9ab5e0;color:#000;">WARUNKI TECHNICZNE</td>
  </tr>
  <tr style="border:1px solid #ccc;">
    <td style="border:1px solid #ccc;padding:8px;text-align:left;font-size:14px;line-height:200%;padding-bottom:40px;background-color:#fff;color:#000;">
      <p>Dla prawidłowego korzystania ze Strony internetowej konieczne jest spełnienie następujących warunków technicznych:</p>
      <ul>
        <li>urządzenie z dostępem do Internetu,</li>
        <li>przeglądarka internetowa obsługująca JavaScript i pliki cookies,</li>
        <li>aktywne konto e-mail — jeśli korzystasz z funkcji wymagających podania adresu e-mail.</li>
      </ul>
      <p>Ewentualne dodatkowe wymogi techniczne dotyczące Usług rozszerzonych są wskazywane Użytkownikowi zgodnie z wymogami przepisów prawa.</p>
    </td>
  </tr>

  <!-- USŁUGI NA STRONIE INTERNETOWEJ -->
  <tr style="border:1px solid #ccc;">
    <td rowspan="2" style="border:1px solid #ccc;padding:8px;width:200px;max-width:200px;text-align:center;vertical-align:top;background-color:#fff;color:#2f5496;padding-top:40px;">
      <svg width="60" height="60" stroke-width="1.5" viewBox="0 0 24 24" fill="#FFFFFF" color="#2f5496"><path fill="#FFFFFF" d="M3.2 14.2222V4C3.2 2.89543 4.09543 2 5.2 2H18.8C19.9046 2 20.8 2.89543 20.8 4V14.2222M3.2 14.2222H20.8M3.2 14.2222L1.71969 19.4556C1.35863 20.7321 2.31762 22 3.64418 22H20.3558C21.6824 22 22.6414 20.7321 22.2803 19.4556L20.8 14.2222" stroke="#2f5496" stroke-width="1.5"></path><path fill="#FFFFFF" d="M11 19L13 19" stroke="#2f5496" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
    </td>
    <td style="border:1px solid #ccc;padding:8px;text-align:center;font-weight:bold;text-transform:uppercase;font-size:18px;line-height:20px;background-color:#9ab5e0;color:#000;">USŁUGI NA STRONIE INTERNETOWEJ</td>
  </tr>
  <tr style="border:1px solid #ccc;">
    <td style="border:1px solid #ccc;padding:8px;text-align:left;font-size:14px;line-height:200%;padding-bottom:40px;background-color:#fff;color:#000;">
      <p>Na naszej Stronie internetowej świadczymy usługi cyfrowe, wskazane niżej w Regulaminie („Usługi" lub „Usługa").</p>
      <p>W ramach Strony internetowej wyróżniamy Usługi:</p>
      <p><strong>a) Podstawowe:</strong></p>
      <ul>
        <li>możliwość przeglądania naszej Strony internetowej,</li>
        <li>formularz kontaktowy pozwalający na wysłanie do nas wiadomości.</li>
      </ul>
      <p><strong>oraz</strong></p>
      <p><strong>b) Rozszerzone:</strong></p>
      <ul>
        <li>Sprzedaż subskrypcji oraz kredytów (zasady korzystania z tej usługi określone są w odrębnym dokumencie, dostępnym tutaj: <a href="https://www.bitbrew.pl/regulamin" target="_blank" rel="noopener noreferrer">https://www.bitbrew.pl/regulamin</a>),</li>
        <li>usługa umożliwiająca wprowadzenie przez Ciebie własnych treści w ramach Strony internetowej (zasady korzystania z tej usługi opisane są niżej, w załączniku do tego Regulaminu).</li>
      </ul>
      <p><strong>USŁUGI PODSTAWOWE</strong></p>
      <p>Korzystanie z Usług podstawowych na Stronie internetowej jest bezpłatne, całkowicie dobrowolne i zależne od Twojej woli. W celu skorzystania z Usługi podstawowej należy skorzystać z odpowiednich funkcji Strony internetowej.</p>
      <p>Rozpoczynamy świadczenie Usługi podstawowej w momencie rozpoczęcia korzystania przez Ciebie z tej Usługi.</p>
      <p>Możesz bez ponoszenia jakichkolwiek kosztów w każdym czasie zrezygnować ze świadczenia Usługi podstawowej, poprzez zakończenie korzystania z tej Usługi.</p>
    </td>
  </tr>

  <!-- ROZPATRYWANIE REKLAMACJI -->
  <tr style="border:1px solid #ccc;">
    <td rowspan="2" style="border:1px solid #ccc;padding:8px;width:200px;max-width:200px;text-align:center;vertical-align:top;background-color:#fff;color:#2f5496;padding-top:40px;">
      <svg width="60" height="60" viewBox="0 0 24 24" stroke-width="1.5" fill="#FFFFFF" color="#2f5496"><path fill="#FFFFFF" d="M20.5 20.5L22 22" stroke="#2f5496" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#FFFFFF" d="M15 18C15 19.6569 16.3431 21 18 21C18.8299 21 19.581 20.663 20.1241 20.1185C20.6654 19.5758 21 18.827 21 18C21 16.3431 19.6569 15 18 15C16.3431 15 15 16.3431 15 18Z" stroke="#2f5496" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#FFFFFF" d="M20 12V5.74853C20 5.5894 19.9368 5.43679 19.8243 5.32426L16.6757 2.17574C16.5632 2.06321 16.4106 2 16.2515 2H4.6C4.26863 2 4 2.26863 4 2.6V21.4C4 21.7314 4.26863 22 4.6 22H11" stroke="#2f5496" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#FFFFFF" d="M16 2V5.4C16 5.73137 16.2686 6 16.6 6H20" stroke="#2f5496" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
    </td>
    <td style="border:1px solid #ccc;padding:8px;text-align:center;font-weight:bold;text-transform:uppercase;font-size:18px;line-height:20px;background-color:#9ab5e0;color:#000;">ROZPATRYWANIE REKLAMACJI</td>
  </tr>
  <tr style="border:1px solid #ccc;">
    <td style="border:1px solid #ccc;padding:8px;text-align:left;font-size:14px;line-height:200%;padding-bottom:40px;background-color:#fff;color:#000;">
      <p>Prosimy o składanie ewentualnych reklamacji dotyczących Strony internetowej i Usług za pośrednictwem Punktu Kontaktowego, którego dane wskazane są na początku Regulaminu.</p>
      <p>Rozpatrujemy reklamacje w ciągu 14 dni od ich otrzymania.</p>
      <p>Szczegółowe procedury reklamacyjne w odniesieniu do Usług rozszerzonych określone zostały odrębnie, w ramach zasad dotyczących danej Usługi.</p>
    </td>
  </tr>

  <!-- PRYWATNOŚĆ I DANE OSOBOWE -->
  <tr style="border:1px solid #ccc;">
    <td rowspan="2" style="border:1px solid #ccc;padding:8px;width:200px;max-width:200px;text-align:center;vertical-align:top;background-color:#fff;color:#2f5496;padding-top:40px;">
      <svg width="60" height="60" viewBox="0 0 24 24" stroke-width="1.5" fill="#FFFFFF" color="#2f5496"><path fill="#FFFFFF" d="M20 12V5.74853C20 5.5894 19.9368 5.43679 19.8243 5.32426L16.6757 2.17574C16.5632 2.06321 16.4106 2 16.2515 2H4.6C4.26863 2 4 2.26863 4 2.6V21.4C4 21.7314 4.26863 22 4.6 22H13" stroke="#2f5496" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#FFFFFF" d="M8 10H16M8 6H12M8 14H11" stroke="#2f5496" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#FFFFFF" d="M16 2V5.4C16 5.73137 16.2686 6 16.6 6H20" stroke="#2f5496" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#FFFFFF" d="M19.9923 15.125L22.5477 15.774C22.8137 15.8416 23.0013 16.0833 22.9931 16.3576C22.8214 22.1159 19.5 23 19.5 23C19.5 23 16.1786 22.1159 16.0069 16.3576C15.9987 16.0833 16.1863 15.8416 16.4523 15.774L19.0077 15.125C19.3308 15.043 19.6692 15.043 19.9923 15.125Z" stroke="#2f5496" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
    </td>
    <td style="border:1px solid #ccc;padding:8px;text-align:center;font-weight:bold;text-transform:uppercase;font-size:18px;line-height:20px;background-color:#9ab5e0;color:#000;">PRYWATNOŚĆ I DANE OSOBOWE</td>
  </tr>
  <tr style="border:1px solid #ccc;">
    <td style="border:1px solid #ccc;padding:8px;text-align:left;font-size:14px;line-height:200%;padding-bottom:40px;background-color:#fff;color:#000;">
      <p>Zasady przetwarzania danych osobowych i wykorzystywania plików cookies wskazane są w polityce prywatności dostępnej pod adresem: <strong><a href="https://www.bitbrew.pl/polityka-prywatnosci" target="_blank" rel="noopener noreferrer">https://www.bitbrew.pl/polityka-prywatnosci</a></strong></p>
    </td>
  </tr>

  <!-- POZOSTAŁE POSTANOWIENIA -->
  <tr style="border:1px solid #ccc;">
    <td rowspan="2" style="border:1px solid #ccc;padding:8px;width:200px;max-width:200px;text-align:center;vertical-align:top;background-color:#fff;color:#2f5496;padding-top:40px;">
      <svg width="60" height="60" viewBox="0 0 24 24" stroke-width="1.5" fill="#FFFFFF" color="#2f5496"><path fill="#FFFFFF" d="M20 12V5.74853C20 5.5894 19.9368 5.43679 19.8243 5.32426L16.6757 2.17574C16.5632 2.06321 16.4106 2 16.2515 2H4.6C4.26863 2 4 2.26863 4 2.6V21.4C4 21.7314 4.26863 22 4.6 22H11" stroke="#2f5496" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#FFFFFF" d="M8 10H16M8 6H12M8 14H11" stroke="#2f5496" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#FFFFFF" d="M20.5 20.5L22 22" stroke="#2f5496" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#FFFFFF" d="M15 18C15 19.6569 16.3431 21 18 21C18.8299 21 19.581 20.663 20.1241 20.1185C20.6654 19.5758 21 18.827 21 18C21 16.3431 19.6569 15 18 15C16.3431 15 15 16.3431 15 18Z" stroke="#2f5496" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#FFFFFF" d="M16 2V5.4C16 5.73137 16.2686 6 16.6 6H20" stroke="#2f5496" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
    </td>
    <td style="border:1px solid #ccc;padding:8px;text-align:center;font-weight:bold;text-transform:uppercase;font-size:18px;line-height:20px;background-color:#9ab5e0;color:#000;">POZOSTAŁE POSTANOWIENIA DOTYCZĄCE USŁUG</td>
  </tr>
  <tr style="border:1px solid #ccc;">
    <td style="border:1px solid #ccc;padding:8px;text-align:left;font-size:14px;line-height:200%;padding-bottom:40px;background-color:#fff;color:#000;">
      <p>Każdorazowe skorzystanie przez Ciebie z Usługi uregulowanej w niniejszym dokumencie stanowi odrębną umowę, a jej aktualna treść — w postaci niniejszego Regulaminu — jest dostępna na Stronie internetowej.</p>
      <p>Zakazane jest dostarczanie przez Ciebie w ramach Usług treści o charakterze bezprawnym.</p>
      <p>Umowa zawierana jest w języku polskim, na czas i w celu świadczenia Usługi. Umowa podlega przepisom prawa polskiego, z zastrzeżeniem kolejnego zdania.</p>
      <p>Wybór prawa polskiego dla umowy zawartej na podstawie Regulaminu z Konsumentem nie uchyla i nie ogranicza Twoich konsumenckich praw przysługujących Ci na podstawie bezwzględnie obowiązujących przepisów prawa, znajdujących zastosowanie dla Ciebie w sytuacji, w której nie ma miejsca wybór prawa. Oznacza to w szczególności, że jeśli właściwe dla Ciebie przepisy krajowe przewidują szerszą ochronę konsumencką niż wynikająca z niniejszego Regulaminu lub prawa polskiego — stosuje się tę ochronę szerszą.</p>
      <p>W przypadku ewentualnego sporu związanego z umową, jeśli nie jesteś Usługobiorcą uprzywilejowanym, sądem właściwym będzie sąd właściwy dla naszej siedziby.</p>
      <p>Wszelka nasza odpowiedzialność w związku z umową zawartą w oparciu o Regulamin w stosunku do Ciebie — jeśli nie jesteś Usługobiorcą uprzywilejowanym — w granicach prawem dopuszczonych, jest wyłączona.</p>
    </td>
  </tr>

  <!-- ZAŁĄCZNIK - nagłówek -->
  <tr style="border:1px solid #ccc;">
    <td colspan="2" style="border:1px solid #ccc;padding:8px;text-align:center;font-weight:bold;text-transform:uppercase;font-size:18px;line-height:20px;background-color:#9ab5e0;color:#000;">Załącznik do Regulaminu — Zasady dotyczące treści Użytkowników zamieszczanych w ramach Strony internetowej</td>
  </tr>

  <!-- TREŚCI WPROWADZANE PRZEZ UŻYTKOWNIKÓW -->
  <tr style="border:1px solid #ccc;">
    <td style="border:1px solid #ccc;padding:8px;width:200px;max-width:200px;text-align:center;vertical-align:top;background-color:#fff;color:#2f5496;padding-top:40px;">
      <svg width="60" height="60" viewBox="0 0 24 24" stroke-width="1.5" fill="#FFFFFF" color="#2f5496"><path fill="#FFFFFF" d="M14.3632 5.65156L15.8431 4.17157C16.6242 3.39052 17.8905 3.39052 18.6716 4.17157L20.0858 5.58579C20.8668 6.36683 20.8668 7.63316 20.0858 8.41421L18.6058 9.8942M14.3632 5.65156L4.74749 15.2672C4.41542 15.5993 4.21079 16.0376 4.16947 16.5054L3.92738 19.2459C3.87261 19.8659 4.39148 20.3848 5.0115 20.33L7.75191 20.0879C8.21972 20.0466 8.65806 19.8419 8.99013 19.5099L18.6058 9.8942M14.3632 5.65156L18.6058 9.8942" stroke="#2f5496" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
    </td>
    <td style="border:1px solid #ccc;padding:8px;text-align:left;font-size:14px;line-height:200%;padding-bottom:40px;background-color:#fff;color:#000;">
      <p><strong>TREŚCI WPROWADZANE PRZEZ UŻYTKOWNIKÓW</strong></p>
      <p>Umożliwiamy Ci wprowadzenie za pośrednictwem naszej Strony internetowej treści przeznaczonych do wyświetlenia na Stronie internetowej.</p>
      <p>Realizacja usługi przez nas następuje w momencie skorzystania z niej przez Ciebie. Możesz w każdym czasie zrezygnować z wprowadzenia treści, poprzez zakończenie korzystania z tej funkcji.</p>
    </td>
  </tr>

  <!-- OGRANICZENIA DOTYCZĄCE TREŚCI -->
  <tr style="border:1px solid #ccc;">
    <td rowspan="2" style="border:1px solid #ccc;padding:8px;width:200px;max-width:200px;text-align:center;vertical-align:top;background-color:#fff;color:#2f5496;padding-top:40px;">
      <svg width="60" height="60" stroke-width="1.5" viewBox="0 0 24 24" fill="#FFFFFF" color="#2f5496"><path fill="#FFFFFF" d="M19.1414 5C17.3265 3.14864 14.7974 2 12 2C6.47715 2 2 6.47715 2 12C2 14.7255 3.09032 17.1962 4.85857 19M19.1414 5C20.9097 6.80375 22 9.27455 22 12C22 17.5228 17.5228 22 12 22C9.20261 22 6.67349 20.8514 4.85857 19M19.1414 5L4.85857 19" stroke="#2f5496" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
    </td>
    <td style="border:1px solid #ccc;padding:8px;text-align:center;font-weight:bold;text-transform:uppercase;font-size:18px;line-height:20px;background-color:#9ab5e0;color:#000;">OGRANICZENIA DOTYCZĄCE TREŚCI WPROWADZANYCH PRZEZ UŻYTKOWNIKÓW</td>
  </tr>
  <tr style="border:1px solid #ccc;">
    <td style="border:1px solid #ccc;padding:8px;text-align:left;font-size:14px;line-height:200%;padding-bottom:40px;background-color:#fff;color:#000;">
      <p>Pamiętaj, że korzystając z naszej Strony internetowej nie możesz wprowadzać nielegalnych treści (w szczególności treści takich jak nawoływanie do nienawiści, treści o charakterze terrorystycznym i niezgodne z prawem treści dyskryminujące), albo treści, które stają się nielegalne na mocy obowiązujących przepisów ze względu na fakt, iż odnoszą się one do nielegalnych działań. Przykładowo, za nielegalne treści uznawane są działania takie jak:</p>
      <ul>
        <li>udostępnianie obrazów przedstawiających niegodziwe traktowanie dzieci w celach seksualnych,</li>
        <li>bezprawne udostępnianie prywatnych obrazów bez zgody,</li>
        <li>cyberstalking,</li>
        <li>nieuprawnione wykorzystanie materiałów chronionych prawem autorskim,</li>
        <li>nielegalne oferowanie usług zakwaterowania,</li>
        <li>nielegalna sprzedaż żywych zwierząt.</li>
      </ul>
      <p>Nie powinieneś też wprowadzać treści naruszających zasady współżycia społecznego lub niezgodnych z warunkami korzystania z naszych Usług. W szczególności w ramach korzystania z naszej strony zabronione jest wprowadzanie treści mogących stanowić:</p>
      <ul>
        <li><strong>Upokarzające, obrażające lub poniżające materiały:</strong> wszelkie treści mogące być uznane za obraźliwe lub poniżające, a także mogące naruszać czyjekolwiek dobre imię.</li>
        <li><strong>Treści erotyczne:</strong> materiały o charakterze pornograficznym lub inne treści o wyraźnym podłożu seksualnym.</li>
        <li><strong>Nieprawdziwe informacje i dezinformacja:</strong> rozpowszechnianie fałszywych informacji lub treści wprowadzających użytkowników w błąd.</li>
        <li><strong>Propaganda i ideologie totalitarne:</strong> materiały promujące ideologie lub działania uznane w Polsce za nielegalne.</li>
        <li><strong>Spam i niezamówione informacje reklamowe:</strong> wysyłanie lub publikowanie niezamówionych materiałów reklamowych lub marketingowych.</li>
        <li><strong>Naruszenie praw własności intelektualnej:</strong> publikowanie treści bez odpowiednich praw lub licencji.</li>
        <li><strong>Podszywanie się pod innych użytkowników:</strong> udawanie kogoś innego lub publikowanie treści w imieniu innej osoby bez jej zgody.</li>
        <li><strong>Treści niezwiązane z działalnością Strony internetowej:</strong> publikowanie materiałów, które nie są związane z tematyką lub celem działania Strony internetowej.</li>
        <li><strong>Treści powszechnie uznane za nieprzyzwoite:</strong> w tym wulgaryzmy.</li>
      </ul>
    </td>
  </tr>

  <!-- ZGŁASZANIE NIELEGALNYCH TREŚCI -->
  <tr style="border:1px solid #ccc;">
    <td rowspan="2" style="border:1px solid #ccc;padding:8px;width:200px;max-width:200px;text-align:center;vertical-align:top;background-color:#fff;color:#2f5496;padding-top:40px;">
      <svg width="60" height="60" stroke-width="1.5" viewBox="0 0 24 24" fill="#FFFFFF" color="#2f5496"><path fill="#FFFFFF" d="M12 8L12 12" stroke="#2f5496" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#FFFFFF" d="M12 16.01L12.01 15.9989" stroke="#2f5496" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#FFFFFF" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.8214 2.48697 15.5291 3.33782 17L2.5 21.5L7 20.6622C8.47087 21.513 10.1786 22 12 22Z" stroke="#2f5496" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
    </td>
    <td style="border:1px solid #ccc;padding:8px;text-align:center;font-weight:bold;text-transform:uppercase;font-size:18px;line-height:20px;background-color:#9ab5e0;color:#000;">ZGŁASZANIE NIELEGALNYCH TREŚCI</td>
  </tr>
  <tr style="border:1px solid #ccc;">
    <td style="border:1px solid #ccc;padding:8px;text-align:left;font-size:14px;line-height:200%;padding-bottom:40px;background-color:#fff;color:#000;">
      <p>Jeśli chcesz zgłosić nam nielegalne treści, skontaktuj się z nami za pośrednictwem adresu e-mail:</p>
      <p><strong>kontakt@perceply.pl</strong></p>
      <p>lub formularza kontaktowego dostępnego pod adresem:</p>
      <p><strong><a href="https://www.bitbrew.pl" target="_blank" rel="noopener noreferrer">https://www.bitbrew.pl</a></strong></p>
      <p><strong>Prosimy, abyś w zgłoszeniu zawarł/a:</strong></p>
      <ul>
        <li>Wystarczająco uzasadnione wyjaśnienie powodów, dla których zarzucasz, że odpowiednie informacje stanowią nielegalne treści.</li>
        <li>Jasne wskazanie dokładnej elektronicznej lokalizacji informacji (adres URL) oraz, w stosownych przypadkach, dodatkowe informacje umożliwiające identyfikację nielegalnych treści.</li>
        <li>Twoje imię i nazwisko oraz adres e-mail — z wyjątkiem zgłoszenia dotyczącego informacji uznawanych za związane z przestępstwami seksualnymi wobec dzieci.</li>
        <li>Oświadczenie potwierdzające powzięte w dobrej wierze przekonanie, że informacje i zarzuty w zgłoszeniu są prawidłowe i kompletne.</li>
      </ul>
      <p>Zbieramy te informacje ze względu na art. 16 ust. 2 Rozporządzenia DSA (Akt o usługach cyfrowych, UE 2022/2065).</p>
      <p>W przypadku wysłania zgłoszenia — potwierdzimy jego otrzymanie i poinformujemy o podjętych działaniach.</p>
    </td>
  </tr>

  <!-- WZÓR ZGŁOSZENIA -->
  <tr style="border:1px solid #ccc;">
    <td rowspan="2" style="border:1px solid #ccc;padding:8px;width:200px;max-width:200px;text-align:center;vertical-align:top;background-color:#fff;color:#2f5496;padding-top:40px;">
      <svg width="60" height="60" stroke-width="1.5" viewBox="0 0 24 24" fill="#FFFFFF" color="#2f5496"><path fill="#FFFFFF" d="M21.4383 11.6622L12.2483 20.8522C11.1225 21.9781 9.59552 22.6106 8.00334 22.6106C6.41115 22.6106 4.88418 21.9781 3.75834 20.8522C2.63249 19.7264 2 18.1994 2 16.6072C2 15.015 2.63249 13.4881 3.75834 12.3622L12.9483 3.17222C13.6989 2.42166 14.7169 2 15.7783 2C16.8398 2 17.8578 2.42166 18.6083 3.17222C19.3589 3.92279 19.7806 4.94077 19.7806 6.00222C19.7806 7.06368 19.3589 8.08166 18.6083 8.83222L9.40834 18.0222C9.03306 18.3975 8.52406 18.6083 7.99334 18.6083C7.46261 18.6083 6.95362 18.3975 6.57834 18.0222C6.20306 17.6469 5.99222 17.138 5.99222 16.6072C5.99222 16.0765 6.20306 15.5675 6.57834 15.1922L15.0683 6.71222" stroke="#2f5496" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
    </td>
    <td style="border:1px solid #ccc;padding:8px;text-align:center;font-weight:bold;text-transform:uppercase;font-size:18px;line-height:20px;background-color:#9ab5e0;color:#000;">WZÓR ZGŁOSZENIA INFORMACJI NIELEGALNYCH</td>
  </tr>
  <tr style="border:1px solid #ccc;">
    <td style="border:1px solid #ccc;padding:8px;text-align:left;font-size:14px;line-height:200%;padding-bottom:40px;background-color:#fff;color:#000;">
      <p>W celu usprawnienia procesu zgłaszania nielegalnych treści zachęcamy do przesyłania informacji zgodnie z poniższym wzorem. Skorzystanie z wzoru NIE JEST obowiązkowe.</p>
      <p><strong>Imię i nazwisko zgłaszającego:</strong> ……………………….</p>
      <p><strong>Adres e-mail zgłaszającego:</strong> ………………………</p>
      <p>(Pola na dane zgłaszającego nie odnoszą się do zgłoszeń dotyczących przestępstw seksualnych wobec dzieci — art. 3–7 dyrektywy 2011/93/UE)</p>
      <p><strong>Adres/y URL zgłaszanych treści:</strong><br>……………………………………………………………………………………………………………</p>
      <p><strong>Ewentualne dodatkowe informacje pozwalające na identyfikację treści:</strong><br>……………………………………………………………</p>
      <p><strong>Uzasadnione wyjaśnienie powodów, dla których zarzucam, że zgłaszane informacje stanowią nielegalne treści:</strong></p>
      <p>………………………………………………………………………………………………………………………</p>
      <p>………………………………………………………………………………………………………………………</p>
      <p><strong>Oświadczam, że w dobrej wierze powziąłem/powzięłam przekonanie, że informacje i zarzuty w moim zgłoszeniu są prawidłowe i kompletne.</strong></p>
    </td>
  </tr>

  <!-- MODEROWANIE TREŚCI -->
  <tr style="border:1px solid #ccc;">
    <td rowspan="2" style="border:1px solid #ccc;padding:8px;width:200px;max-width:200px;text-align:center;vertical-align:top;background-color:#fff;color:#2f5496;padding-top:40px;">
      <svg width="60" height="60" viewBox="0 0 24 24" stroke-width="1.5" fill="#FFFFFF" color="#2f5496"><path fill="#FFFFFF" d="M21 21L9 21" stroke="#2f5496" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#FFFFFF" d="M15.889 14.8891L8.46436 7.46448" stroke="#2f5496" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#FFFFFF" d="M2.8934 12.6066L12.0858 3.41421C12.8668 2.63317 14.1332 2.63317 14.9142 3.41421L19.864 8.36396C20.645 9.14501 20.645 10.4113 19.864 11.1924L10.6213 20.435C10.2596 20.7968 9.76894 21 9.25736 21C8.74577 21 8.25514 20.7968 7.8934 20.435L2.8934 15.435C2.11235 14.654 2.11235 13.3877 2.8934 12.6066Z" stroke="#2f5496" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
    </td>
    <td style="border:1px solid #ccc;padding:8px;text-align:center;font-weight:bold;text-transform:uppercase;font-size:18px;line-height:20px;background-color:#9ab5e0;color:#000;">MODEROWANIE TREŚCI</td>
  </tr>
  <tr style="border:1px solid #ccc;">
    <td style="border:1px solid #ccc;padding:8px;text-align:left;font-size:14px;line-height:200%;padding-bottom:40px;background-color:#fff;color:#000;">
      <p>Treści wprowadzane przez użytkowników są przez nas moderowane w odpowiedzi na zgłoszenia użytkowników.</p>
      <p>Reagujemy na wszelkie zgłoszenia dotyczące możliwego naruszenia prawa lub zasad współżycia społecznego. Bezzwłocznie podejmujemy odpowiednie działania w celu usunięcia lub uniemożliwienia dostępu do nielegalnych treści — gdy tylko uzyskamy taką wiedzę lub wiadomość.</p>
      <p>Możemy też z własnej inicjatywy moderować treści wprowadzane przez użytkowników. Pamiętaj, że nie jesteśmy zobligowani do samodzielnego wyszukiwania nielegalnych treści.</p>
      <p>Stosujemy jednak z własnej inicjatywy, w dobrej wierze i z należytą starannością, automatyczne mechanizmy moderowania treści:</p>
      <p><strong>Automatyczna moderacja treści</strong></p>
      <p>Serwis stosuje automatyczny system moderowania treści, który analizuje dane wprowadzane przez Użytkownika — w szczególności nazwy marek oraz treści dodawane do Bazy Wiedzy o marce. System działa w czasie rzeczywistym i może odrzucić treści zawierające:</p>
      <ul>
        <li>mowę nienawiści lub dyskryminację ze względu na rasę, płeć, orientację seksualną, wyznanie lub inne cechy chronione,</li>
        <li>groźby, przemoc lub treści nawołujące do samookaleczenia,</li>
        <li>treści o charakterze seksualnym, w szczególności z udziałem osób nieletnich,</li>
        <li>treści stanowiące spam, oszustwo lub próbę manipulacji systemem,</li>
        <li>inne treści naruszające niniejszy Regulamin lub powszechnie obowiązujące przepisy prawa.</li>
      </ul>
      <p>Odrzucenie treści przez system moderacji skutkuje brakiem możliwości wykonania analizy lub zapisania fragmentu wiedzy. Użytkownik zostaje o tym poinformowany stosownym komunikatem w interfejsie serwisu. Serwis nie przechowuje treści odrzuconych przez system moderacji.</p>
      <p>Automatyczna moderacja nie zastępuje odpowiedzialności Użytkownika za wprowadzane treści. Użytkownik ponosi pełną odpowiedzialność za zgodność publikowanych treści z prawem i niniejszym Regulaminem. Administrator zastrzega sobie prawo do ręcznego przeglądu i usunięcia treści naruszających zasady serwisu, także w przypadkach, gdy nie zostały one wykryte przez system automatyczny.</p>
      <p>Treści mogą być też przeglądane przez nas ręcznie, bez udziału narzędzi automatycznych.</p>
      <p>Moderowanie treści ma miejsce w oparciu o przepisy prawa, w szczególności przepisy aktu o usługach cyfrowych (DSA).</p>
    </td>
  </tr>

  <!-- UZASADNIENIE DZIAŁAŃ -->
  <tr style="border:1px solid #ccc;">
    <td rowspan="2" style="border:1px solid #ccc;padding:8px;width:200px;max-width:200px;text-align:center;vertical-align:top;background-color:#fff;color:#2f5496;padding-top:40px;">
      <svg width="60" height="60" stroke-width="1.5" viewBox="0 0 24 24" fill="#FFFFFF" color="#2f5496"><path fill="#FFFFFF" d="M12 7V9" stroke="#2f5496" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#FFFFFF" d="M12 13.01L12.01 12.9989" stroke="#2f5496" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#FFFFFF" d="M3 20.2895V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V15C21 16.1046 20.1046 17 19 17H7.96125C7.35368 17 6.77906 17.2762 6.39951 17.7506L4.06852 20.6643C3.71421 21.1072 3 20.8567 3 20.2895Z" stroke="#2f5496" stroke-width="1.5"></path></svg>
    </td>
    <td style="border:1px solid #ccc;padding:8px;text-align:center;font-weight:bold;text-transform:uppercase;font-size:18px;line-height:20px;background-color:#9ab5e0;color:#000;">UZASADNIENIE DZIAŁAŃ, KTÓRE PODEJMUJEMY WOBEC TREŚCI OD UŻYTKOWNIKÓW</td>
  </tr>
  <tr style="border:1px solid #ccc;">
    <td style="border:1px solid #ccc;padding:8px;text-align:left;font-size:14px;line-height:200%;padding-bottom:40px;background-color:#fff;color:#000;">
      <p>W przypadku podjęcia działań wobec treści nielegalnych lub niezgodnych z opisanymi w tym dokumencie zasadami, informujemy wszystkich zainteresowanych odbiorców — o ile znamy ich odpowiednie elektroniczne dane kontaktowe — o nałożonych ograniczeniach, w postaci:</p>
      <ul>
        <li>Ograniczenia w zakresie widoczności określonych informacji, w tym usuwanie treści, uniemożliwianie dostępu do treści lub depozycjonowanie treści.</li>
        <li>Zawieszenie, zakończenie lub inne ograniczenie płatności pieniężnych.</li>
        <li>Zawieszenie lub zakończenie świadczenia usługi w całości lub w części.</li>
        <li>Zawieszenie lub zamknięcie konta odbiorcy usługi.</li>
      </ul>
      <p>Każde podjęte przez nas działanie zostanie uzasadnione.</p>
      <p>Możemy odstąpić od takiej informacji, jeżeli treści są wprowadzającymi w błąd treściami handlowymi o dużej objętości.</p>
    </td>
  </tr>

  <!-- REKLAMACJE I SKARGI -->
  <tr style="border:1px solid #ccc;">
    <td rowspan="2" style="border:1px solid #ccc;padding:8px;width:200px;max-width:200px;text-align:center;vertical-align:top;background-color:#fff;color:#2f5496;padding-top:40px;">
      <svg width="60" height="60" viewBox="0 0 24 24" stroke-width="1.5" fill="#FFFFFF" color="#2f5496"><path fill="#FFFFFF" d="M7 8L12 11L17 8" stroke="#2f5496" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#FFFFFF" d="M10 20H4C2.89543 20 2 19.1046 2 18V6C2 4.89543 2.89543 4 4 4H20C21.1046 4 22 4.89543 22 6V12.8571" stroke="#2f5496" stroke-width="1.5" stroke-linecap="round"></path><path fill="#FFFFFF" d="M13 17.1111H19.3C22.9 17.1111 22.9 22 19.3 22M13 17.1111L16.15 14M13 17.1111L16.15 20.2222" stroke="#2f5496" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
    </td>
    <td style="border:1px solid #ccc;padding:8px;text-align:center;font-weight:bold;text-transform:uppercase;font-size:18px;line-height:20px;background-color:#9ab5e0;color:#000;">REKLAMACJE I SKARGI</td>
  </tr>
  <tr style="border:1px solid #ccc;">
    <td style="border:1px solid #ccc;padding:8px;text-align:left;font-size:14px;line-height:200%;padding-bottom:40px;background-color:#fff;color:#000;">
      <p>Prosimy o składanie ewentualnych reklamacji i skarg dotyczących treści wprowadzonych przez Użytkowników lub usługi umożliwiającej ich wprowadzenie na adres pocztowy lub elektroniczny wskazany w Regulaminie.</p>
      <p>Ustosunkujemy się do reklamacji w terminie 14 dni od otrzymania zgłoszenia reklamacyjnego.</p>
    </td>
  </tr>

  <!-- USŁUGOBIORCY UPRZYWILEJOWANI -->
  <tr style="border:1px solid #ccc;">
    <td rowspan="2" style="border:1px solid #ccc;padding:8px;width:200px;max-width:200px;text-align:center;vertical-align:top;background-color:#fff;color:#2f5496;padding-top:40px;">
      <svg width="60" height="60" stroke-width="1.5" viewBox="0 0 24 24" fill="#FFFFFF" color="#2f5496"><path fill="#FFFFFF" d="M1 20V19C1 15.134 4.13401 12 8 12V12C11.866 12 15 15.134 15 19V20" stroke="#2f5496" stroke-width="1.5" stroke-linecap="round"></path><path fill="#FFFFFF" d="M13 14V14C13 11.2386 15.2386 9 18 9V9C20.7614 9 23 11.2386 23 14V14.5" stroke="#2f5496" stroke-width="1.5" stroke-linecap="round"></path><path fill="#FFFFFF" d="M8 12C10.2091 12 12 10.2091 12 8C12 5.79086 10.2091 4 8 4C5.79086 4 4 5.79086 4 8C4 10.2091 5.79086 12 8 12Z" stroke="#2f5496" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill="#FFFFFF" d="M18 9C19.6569 9 21 7.65685 21 6C21 4.34315 19.6569 3 18 3C16.3431 3 15 4.34315 15 6C15 7.65685 16.3431 9 18 9Z" stroke="#2f5496" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
    </td>
    <td style="border:1px solid #ccc;padding:8px;text-align:center;font-weight:bold;text-transform:uppercase;font-size:18px;line-height:20px;background-color:#9ab5e0;color:#000;">USŁUGOBIORCY UPRZYWILEJOWANI</td>
  </tr>
  <tr style="border:1px solid #ccc;">
    <td style="border:1px solid #ccc;padding:8px;text-align:left;font-size:14px;line-height:200%;padding-bottom:40px;background-color:#fff;color:#000;">
      <p>Postanowienia tej sekcji dotyczą tylko Usługobiorców uprzywilejowanych.</p>
      <p>Jeśli jesteś Usługobiorcą uprzywilejowanym, to w przypadku zawarcia z Tobą umowy na świadczenie usługi wprowadzenia treści na Stronie internetowej („Umowa"), ponosimy wobec Ciebie odpowiedzialność za zgodność świadczenia z Umową, przewidzianą przez powszechnie obowiązujące przepisy prawa, w tym zwłaszcza przez przepisy polskiej ustawy z dnia 30 maja 2014 r. o prawach konsumenta.</p>
      <p>Jeżeli nie dostarczyliśmy usługi cyfrowej, możesz wezwać nas do jej dostarczenia. Jeżeli mimo to nie dostarczymy usługi cyfrowej niezwłocznie lub w dodatkowym, wyraźnie uzgodnionym terminie, możesz odstąpić od Umowy.</p>
      <p>Możesz odstąpić od Umowy bez wzywania do dostarczenia usługi cyfrowej, jeżeli:</p>
      <ul>
        <li>z naszego oświadczenia lub okoliczności wyraźnie wynika, że nie dostarczymy usługi cyfrowej, lub</li>
        <li>uzgodniliśmy z Tobą lub z okoliczności zawarcia Umowy wyraźnie wynika, że określony termin dostarczenia miał dla Ciebie istotne znaczenie, a my nie dostarczyliśmy jej w tym terminie.</li>
      </ul>
      <p>Jeśli usługa cyfrowa jest niezgodna z Umową, możesz żądać jej doprowadzenia do zgodności z tą Umową.</p>
      <p>Dodatkowo, jeżeli usługa cyfrowa jest niezgodna z Umową, możesz złożyć oświadczenie o odstąpieniu od tej Umowy, gdy:</p>
      <ul>
        <li>doprowadzenie do zgodności jest niemożliwe albo wymaga nadmiernych kosztów,</li>
        <li>nie doprowadziliśmy usługi do zgodności w rozsądnym czasie i bez nadmiernych niedogodności,</li>
        <li>brak zgodności usługi z Umową występuje nadal, mimo że próbowaliśmy go usunąć,</li>
        <li>brak zgodności jest na tyle istotny, że uzasadnia odstąpienie od Umowy bez uprzedniego żądania doprowadzenia do zgodności,</li>
        <li>z naszego oświadczenia lub okoliczności wyraźnie wynika, że nie doprowadzimy usługi do zgodności w rozsądnym czasie.</li>
      </ul>
      <p><strong>Pozasądowe sposoby rozpatrywania reklamacji i dochodzenia roszczeń</strong></p>
      <p>Jako Konsument możesz skorzystać m.in. z pomocy odpowiedniego Europejskiego Centrum Konsumenckiego. Lista Centrów: <a href="https://konsument.gov.pl/eck-w-europie/" target="_blank" rel="noopener noreferrer">https://konsument.gov.pl/eck-w-europie/</a></p>
      <p>Ponadto, na terenie Rzeczypospolitej Polskiej można skorzystać z:</p>
      <ul>
        <li>mediacji prowadzonej przez właściwy terenowo Wojewódzki Inspektorat Inspekcji Handlowej (<a href="https://uokik.gov.pl/kontakt-inspekcja-handlowa" target="_blank" rel="noopener noreferrer">wykaz inspektoratów</a>),</li>
        <li>pomocy stałego polubownego sądu konsumenckiego działającego przy Wojewódzkim Inspektoracie Inspekcji Handlowej.</li>
      </ul>
      <p>Skorzystanie z pozasądowych sposobów rozpatrywania reklamacji jest dobrowolne zarówno dla nas, jak i Konsumenta. Jako Konsument możesz dodatkowo skorzystać z bezpłatnej pomocy miejskiego lub powiatowego rzecznika konsumentów.</p>
      <p><strong>Prawo odstąpienia od umowy</strong></p>
      <p>Jeśli jesteś Usługobiorcą uprzywilejowanym, masz prawo odstąpić od zawartej z nami Umowy w terminie 14 dni bez podania jakiejkolwiek przyczyny.</p>
      <p>Termin do odstąpienia od Umowy wygasa po upływie 14 dni od dnia zawarcia tej Umowy.</p>
      <p>Aby skorzystać z prawa odstąpienia od Umowy, musisz poinformować nas o swojej decyzji w drodze jednoznacznego oświadczenia (pismo wysłane pocztą lub pocztą elektroniczną). Możesz skorzystać z wzoru formularza poniżej — nie jest to obowiązkowe.</p>
      <p><strong>WZÓR FORMULARZA ODSTĄPIENIA OD UMOWY</strong></p>
      <p>(Formularz ten należy wypełnić i odesłać tylko w przypadku chęci odstąpienia od umowy)</p>
      <p>Adresat:<br>Patryk Rybacki, działalność nierejestrowana<br>Biskupia 7/2<br>adres e-mail: kontakt@perceply.pl</p>
      <p>Ja/My(*) niniejszym informuję/informujemy(*) o moim/naszym(*) odstąpieniu od umowy o świadczenie następującej usługi (*):</p>
      <p>………………………………………………………………………………………</p>
      <p>Data zawarcia umowy(*): ………………………………………</p>
      <p>Imię i nazwisko konsumenta(-ów): ………………………………………………</p>
      <p>Adres konsumenta(-ów): ………………………………………………………………</p>
      <p>Podpis konsumenta(-ów) (tylko jeżeli formularz jest przesyłany w wersji papierowej): ………………………………………………</p>
      <p>Data: ………………………………………………</p>
      <p>(*) Niepotrzebne skreślić.</p>
    </td>
  </tr>

  <!-- STOPKA -->
  <tr style="border:1px solid #ccc;">
    <th colspan="2" style="border:1px solid #ccc;padding:8px;background-color:#f5f5f5;color:#000;text-align:center;">
      <small>
        Regulamin strony internetowej z dnia 18.06.2026.<br>
        Numer licencji nadanej przez Kreator Legal Geek: <a href="https://kreator.legalgeek.pl/" target="_blank" rel="noopener noreferrer" style="text-decoration:none;color:inherit;">f6f61186-8cc8-4ba2-b721-8d31432e3f71</a>.
      </small>
    </th>
  </tr>

</table>
          `,
        }}
      />
    </div>
    <Footer />
  </div>
  );
};

export default Terms;

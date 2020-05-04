import React from 'react';
import { Link } from 'react-router';
import { LiberapayWidget } from './elements/liberapay-widget';

const handleClickOnOneTimeDonation = () => {
  document.forms['singlePayPalPayment'].submit();
};

const Donate = () => (
  <div className="box">
    <form id="singlePayPalPayment" action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank" style={{ display: 'none' }}>
      <input type="hidden" name="cmd" value="_s-xclick"/>
      <input type="hidden" name="hosted_button_id" value="HMVYD6GEWNWH8"/>
      <input type="image" src="https://www.paypalobjects.com/webstatic/en_US/i/buttons/PP_logo_h_100x26.png" width="0" height="0" name="submit" alt="PayPal - The safer, easier way to pay online!"/>
      <img alt="" src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1" height="1"/>
    </form>

    <div className="box-header-timeline">
      Donate to FreeFeed
    </div>

    <div className="box-body">
      <br/>

      <p>
        <Link to="/about">FreeFeed</Link> is a small scale open-source social network without ads or
        censorship. It was created by FreeFeed MTU, a non-profit volunteers’ organization which
        continues to develop it now.
      </p>

      <p>All the hosting expenses are covered by donations only.</p>

      <p>You can help us pay for the hosting by setting up a monthly donation.</p>

      <h3>Easy way <small>(accept all cards, 20% commission fee)</small></h3>

      <p><LiberapayWidget project="freefeed"/></p>

      <h3>Paypal way <small>(7% commission fee)</small></h3>

      <p>
        <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">
          <input type="hidden" name="cmd" value="_s-xclick"/>
          <input type="hidden" name="hosted_button_id" value="97PAKQ6S97XMW"/>
          <table>
            <tbody>
              <tr>
                <td style={{ paddingBottom: '5px' }}>
                  <input type="hidden" name="on0" value="Pick monthly donation amount" style={{ padding: '5px 0' }}/>
                </td>
              </tr>
              <tr>
                <td>
                  <select name="os0" defaultValue="Advanced">
                    <option value="Entry Level Supporter">€5.00 EUR / month</option>
                    <option value="Basic Level Supporter">€10.00 EUR / month</option>
                    <option value="Standard Level Supporter">€15.00 EUR / month</option>
                    <option value="Pro Supporter">€20.00 EUR / month</option>
                    <option value="Master Supporter">€30.00 EUR / month</option>
                    <option value="Honorable Supporter">€50.00 EUR / month</option>
                    <option value="Master Donator">€75.00 EUR / month</option>
                    <option value="Chuck Norris">€100.00 EUR / month</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
          <input type="hidden" name="currency_code" value="EUR"/>
          <input type="image" src="https://www.paypalobjects.com/webstatic/en_US/i/buttons/PP_logo_h_100x26.png" name="submit" alt="PayPal - The safer, easier way to pay online!" style={{ margin: '5px' }}/>
          <img alt="" src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1" height="1" style={{ display: 'none' }}/>
        </form>
      </p>

      <p>Alternatively, you can make a <a onClick={handleClickOnOneTimeDonation}>one-time Paypal donation</a>.</p>

      <h3>Responsible way</h3>

      <p>You can set up recurring monthly donation through your internet bank account (commission fees depend on your bank). Payment details:</p>

      <p>
        Organization name: <code>FREEFEED.NET MTÜ</code>
        <br/>
        IBAN: <code>EE982200221062037450</code>
        <br/>
        SWIFT Code: <code>HABAEE2X</code>
        <br/>
        Legal address: <code>Harjumaa, Tallinn linn, Mingi tn 5-25/26, 13424</code>
      </p>

      <h3>The Russian way</h3>

      <p>You can make a one-time payment with your card or Yandex.Money wallet (commission fee 0.5-2%):</p>

      <p><a href="https://yasobe.ru/na/freefeed" target="_blank">Pay with Yandex.Money</a></p>

      <br/>

      <p>Thank you!</p>

      <br/>
    </div>

    <div className="box-header-timeline">
      Помочь Фрифиду
    </div>

    <div className="box-body">
      <br/>

      <p>
        <Link to="/about">FreeFeed</Link> — это небольшая социальная сеть и блог-платформа без
        рекламы и цензуры. Ее создало некоммерческое сообщество пользователей, которые и развивают
        проект. Участники фрифида пишут под псевдонимами, а не под реальными именами; здесь есть
        тематические группы, система ограничения доступа к записям, лайки и баны. На базе сервиса
        сформировалось сообщество, участники которого не только общаются в онлайне, но и проводят
        оффлайновые встречи в разных городах и оказывает друг другу вполне реальную поддержку.
      </p>

      <p>
        Развитием и поддержкой проекта занимается некоммерческая организация FreeFeed MTU, которая
        состоит из пользователей-волонтёров. С момента запуска FreeFeed.net мы стремимся сделать
        так, чтобы проект был полностью самостоятельным: расходы на хостинг сервиса полностью
        покрывались бы взносами пользователей.
      </p>

      <p>Вы можете помочь нам, настроив автоматический ежемесячный платёж.</p>

      <h3>Простой способ <small>(принимает все карты, комиссии около 20%)</small></h3>

      <p><LiberapayWidget project="freefeed"/></p>

      <h3>Paypal <small>(комиссия около 7%)</small></h3>

      <p>
        <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">
          <input type="hidden" name="cmd" value="_s-xclick"/>
          <input type="hidden" name="hosted_button_id" value="97PAKQ6S97XMW"/>
          <table>
            <tbody>
              <tr>
                <td style={{ paddingBottom: '5px' }}>
                  <input type="hidden" name="on0" value="Pick monthly donation amount" style={{ padding: '5px 0' }}/>
                </td>
              </tr>
              <tr>
                <td>
                  <select name="os0" defaultValue="Advanced">
                    <option value="Entry Level Supporter">€5.00 EUR / месяц</option>
                    <option value="Basic Level Supporter">€10.00 EUR / месяц</option>
                    <option value="Standard Level Supporter">€15.00 EUR / месяц</option>
                    <option value="Pro Supporter">€20.00 EUR / месяц</option>
                    <option value="Master Supporter">€30.00 EUR / месяц</option>
                    <option value="Honorable Supporter">€50.00 EUR / месяц</option>
                    <option value="Master Donator">€75.00 EUR / месяц</option>
                    <option value="Chuck Norris">€100.00 EUR / месяц</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
          <input type="hidden" name="currency_code" value="EUR"/>
          <input type="image" src="https://www.paypalobjects.com/webstatic/en_US/i/buttons/PP_logo_h_100x26.png" name="submit" alt="PayPal - The safer, easier way to pay online!" style={{ margin: '5px' }}/>
          <img alt="" src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1" height="1" style={{ display: 'none' }}/>
        </form>
      </p>

      <p>Или вы можете сделать <a onClick={handleClickOnOneTimeDonation}>единовременный взнос</a>.</p>

      <h3>Прямой платеж</h3>

      <p>Вы можете настроить регулярные ежемесячные платежи в вашем интернет-банке (комиссии зависят от вашего банка). Реквизиты:</p>

      <p>
        Получатель платежа: <code>FREEFEED.NET MTÜ</code>
        <br/>
        IBAN: <code>EE982200221062037450</code>
        <br/>
        Код SWIFT: <code>HABAEE2X</code>
        <br/>
        Адрес получателя: <code>Harjumaa, Tallinn linn, Mingi tn 5-25/26, 13424</code>
      </p>

      <h3>Яндекс.Деньги</h3>

      <p>Вы можете сделать единоразовый платеж с помощью платежной карточки или кошелька Яндекс.Денег (комиссия 0.5-2%):</p>

      <p><a href="https://yasobe.ru/na/freefeed" target="_blank">Сделать взнос через Яндекс.Деньги</a></p>

      <br/>

      <p>Спасибо!</p>
    </div>
  </div>
);

export default Donate;

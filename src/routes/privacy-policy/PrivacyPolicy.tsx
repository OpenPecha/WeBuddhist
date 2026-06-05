import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const privacyStyles = `
  [data-custom-class='body'], [data-custom-class='body'] * {
    background: transparent !important;
  }
  [data-custom-class='title'], [data-custom-class='title'] * {
    font-family: inherit !important;
    font-size: 26px !important;
    color: #000000 !important;
  }
  [data-custom-class='subtitle'], [data-custom-class='subtitle'] * {
    font-family: inherit !important;
    color: #595959 !important;
    font-size: 14px !important;
  }
  [data-custom-class='heading_1'], [data-custom-class='heading_1'] * {
    font-family: inherit !important;
    font-size: 19px !important;
    color: #000000 !important;
  }
  [data-custom-class='heading_2'], [data-custom-class='heading_2'] * {
    font-family: inherit !important;
    font-size: 17px !important;
    color: #000000 !important;
  }
  [data-custom-class='body_text'], [data-custom-class='body_text'] * {
    color: #595959 !important;
    font-size: 14px !important;
    font-family: inherit !important;
  }
  [data-custom-class='link'], [data-custom-class='link'] * {
    color: #3030F1 !important;
    font-size: 14px !important;
    font-family: inherit !important;
    word-break: break-word !important;
  }
  .privacy-policy-content h1 {
    font-size: 26px;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }
  .privacy-policy-content h2 {
    font-size: 19px;
    font-weight: 700;
    margin-top: 2rem;
    margin-bottom: 0.75rem;
  }
  .privacy-policy-content h3 {
    font-size: 17px;
    font-weight: 600;
    margin-top: 1.5rem;
    margin-bottom: 0.5rem;
  }
  .privacy-policy-content ul {
    list-style-type: square;
    padding-left: 1.5rem;
    margin-bottom: 0.75rem;
  }
  .privacy-policy-content ul > li > ul {
    list-style-type: circle;
  }
  .privacy-policy-content ul > li > ul > li > ul {
    list-style-type: square;
  }
  .privacy-policy-content table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1rem;
    font-size: 14px;
  }
  .privacy-policy-content td,
  .privacy-policy-content th {
    padding: 0.5rem 0.75rem;
    vertical-align: top;
  }
  bdt {
    display: inline;
  }
`;

const privacyContent = `
<div data-custom-class="body">
<div><strong><span style="font-size: 26px;"><span data-custom-class="title"><h1>PRIVACY POLICY</h1></span></span></strong></div>
<div><span style="color: rgb(127, 127, 127);"><strong><span style="font-size: 15px;"><span data-custom-class="subtitle">Last updated <bdt class="question">June 03, 2026</bdt></span></span></strong></span></div>
<div><br></div>
<div style="line-height: 1.5;"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span data-custom-class="body_text">This Privacy Notice for <bdt class="question">OpenPecha Trust</bdt> ("<strong>we</strong>," "<strong>us</strong>," or "<strong>our</strong>"), describes how and why we might access, collect, store, use, and/or share ("<strong>process</strong>") your personal information when you use our services ("<strong>Services</strong>"), including when you:</span></span></div>
<ul>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Download and use our mobile application (<bdt class="question">WeBuddhist</bdt>), or any other application of ours that links to this Privacy Notice</span></span></li>
</ul>
<ul>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;">Use <bdt class="question">WeBuddhist</bdt>. <bdt class="question">WeBuddhist is a non-profit Buddhist study and practice platform funded by OpenPecha Trust. The mobile and web App provides daily reading plans, canonical texts with audio, recitations and chants, a personal practice routine builder, an AI assistant grounded in Buddhist texts, and community features. We do not sell user data and we do not share it with third parties for their own marketing or commercial purposes.</bdt></span></li>
</ul>
<ul>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Engage with us in other related ways, including any marketing or events</span></span></li>
</ul>
<div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><strong>Questions or concerns?</strong> Reading this Privacy Notice will help you understand your privacy rights and choices. We are responsible for making decisions about how your personal information is processed. If you do not agree with our policies and practices, please do not use our Services. If you still have any questions or concerns, please contact us at <a target="_blank" data-custom-class="link" href="mailto:privacy@webuddhist.com">privacy@webuddhist.com</a>.</span></span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><strong><span style="font-size: 15px;"><span data-custom-class="heading_1"><h2>SUMMARY OF KEY POINTS</h2></span></span></strong></div>
<div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><strong><em>This summary provides key points from our Privacy Notice, but you can find out more details about any of these topics by clicking the link following each key point or by using our </em></strong></span></span><a data-custom-class="link" href="#toc"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text"><strong><em>table of contents</em></strong></span></span></a><span style="font-size: 15px;"><span data-custom-class="body_text"><strong><em> below to find the section you are looking for.</em></strong></span></span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><strong>What personal information do we process?</strong> When you visit, use, or navigate our Services, we may process personal information depending on how you interact with us and the Services, the choices you make, and the products and features you use. Learn more about </span></span><a data-custom-class="link" href="#personalinfo"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text">personal information you disclose to us</span></span></a><span data-custom-class="body_text">.</span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><strong>Do we process any sensitive personal information?</strong> Some of the information may be considered "special" or "sensitive" in certain jurisdictions, for example your racial or ethnic origins, sexual orientation, and religious beliefs. We may process sensitive personal information when necessary with your consent or as otherwise permitted by applicable law. Learn more about </span></span><a data-custom-class="link" href="#sensitiveinfo"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text">sensitive information we process</span></span></a><span data-custom-class="body_text">.</span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><strong>Do we collect any information from third parties?</strong> We do not collect any information from third parties.</span></span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><strong>How do we process your information?</strong> We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent. We process your information only when we have a valid legal reason to do so. Learn more about </span></span><a data-custom-class="link" href="#infouse"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text">how we process your information</span></span></a><span data-custom-class="body_text">.</span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><strong>In what situations and with which parties do we share personal information?</strong> We may share information in specific situations and with specific third parties. Learn more about </span></span><a data-custom-class="link" href="#whoshare"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text">when and with whom we share your personal information</span></span></a><span style="font-size: 15px;"><span data-custom-class="body_text">.</span></span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><strong>How do we keep your information safe?</strong> We have adequate organizational and technical processes and procedures in place to protect your personal information. However, no electronic transmission over the internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other unauthorized third parties will not be able to defeat our security and improperly collect, access, steal, or modify your information. Learn more about </span></span><a data-custom-class="link" href="#infosafe"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text">how we keep your information safe</span></span></a><span data-custom-class="body_text">.</span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><strong>What are your rights?</strong> Depending on where you are located geographically, the applicable privacy law may mean you have certain rights regarding your personal information. Learn more about </span></span><a data-custom-class="link" href="#privacyrights"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text">your privacy rights</span></span></a><span data-custom-class="body_text">.</span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><strong>How do you exercise your rights?</strong> The easiest way to exercise your rights is by visiting <span style="color: rgb(0, 58, 250);">webuddhist.com/privacy-request</span>, or by contacting us. We will consider and act upon any request in accordance with applicable data protection laws.</span></span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">Want to learn more about what we do with any information we collect? </span></span><a data-custom-class="link" href="#toc"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text">Review the Privacy Notice in full</span></span></a><span style="font-size: 15px;"><span data-custom-class="body_text">.</span></span></div>
<div style="line-height: 1.5;"><br></div>

<div id="toc" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>TABLE OF CONTENTS</h2></span></strong></div>
<div style="line-height: 1.5;"><span style="font-size: 15px;"><a data-custom-class="link" href="#infocollect"><span style="color: rgb(0, 58, 250);">1. WHAT INFORMATION DO WE COLLECT?</span></a></span></div>
<div style="line-height: 1.5;"><span style="font-size: 15px;"><a data-custom-class="link" href="#infouse"><span style="color: rgb(0, 58, 250);">2. HOW DO WE PROCESS YOUR INFORMATION?</span></a></span></div>
<div style="line-height: 1.5;"><span style="font-size: 15px;"><a data-custom-class="link" href="#legalbases"><span style="color: rgb(0, 58, 250);">3. WHAT LEGAL BASES DO WE RELY ON TO PROCESS YOUR PERSONAL INFORMATION?</span></a></span></div>
<div style="line-height: 1.5;"><span style="font-size: 15px;"><a data-custom-class="link" href="#whoshare"><span style="color: rgb(0, 58, 250);">4. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</span></a></span></div>
<div style="line-height: 1.5;"><span style="font-size: 15px;"><a data-custom-class="link" href="#cookies"><span style="color: rgb(0, 58, 250);">5. DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?</span></a></span></div>
<div style="line-height: 1.5;"><a data-custom-class="link" href="#ai"><span style="color: rgb(0, 58, 250);">6. DO WE OFFER ARTIFICIAL INTELLIGENCE-BASED PRODUCTS?</span></a></div>
<div style="line-height: 1.5;"><span style="font-size: 15px;"><a data-custom-class="link" href="#sociallogins"><span style="color: rgb(0, 58, 250);">7. HOW DO WE HANDLE YOUR SOCIAL LOGINS?</span></a></span></div>
<div style="line-height: 1.5;"><span style="font-size: 15px;"><a data-custom-class="link" href="#intltransfers"><span style="color: rgb(0, 58, 250);">8. IS YOUR INFORMATION TRANSFERRED INTERNATIONALLY?</span></a></span></div>
<div style="line-height: 1.5;"><span style="font-size: 15px;"><a data-custom-class="link" href="#inforetain"><span style="color: rgb(0, 58, 250);">9. HOW LONG DO WE KEEP YOUR INFORMATION?</span></a></span></div>
<div style="line-height: 1.5;"><span style="font-size: 15px;"><a data-custom-class="link" href="#infosafe"><span style="color: rgb(0, 58, 250);">10. HOW DO WE KEEP YOUR INFORMATION SAFE?</span></a></span></div>
<div style="line-height: 1.5;"><span style="font-size: 15px;"><a data-custom-class="link" href="#infominors"><span style="color: rgb(0, 58, 250);">11. DO WE COLLECT INFORMATION FROM MINORS?</span></a></span></div>
<div style="line-height: 1.5;"><span style="font-size: 15px;"><a data-custom-class="link" href="#privacyrights"><span style="color: rgb(0, 58, 250);">12. WHAT ARE YOUR PRIVACY RIGHTS?</span></a></span></div>
<div style="line-height: 1.5;"><span style="font-size: 15px;"><a data-custom-class="link" href="#DNT"><span style="color: rgb(0, 58, 250);">13. CONTROLS FOR DO-NOT-TRACK FEATURES</span></a></span></div>
<div style="line-height: 1.5;"><span style="font-size: 15px;"><a data-custom-class="link" href="#uslaws"><span style="color: rgb(0, 58, 250);">14. DO UNITED STATES RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?</span></a></span></div>
<div style="line-height: 1.5;"><span style="font-size: 15px;"><a data-custom-class="link" href="#policyupdates"><span style="color: rgb(0, 58, 250);">15. DO WE MAKE UPDATES TO THIS NOTICE?</span></a></span></div>
<div style="line-height: 1.5;"><a data-custom-class="link" href="#contact"><span style="color: rgb(0, 58, 250); font-size: 15px;">16. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</span></a></div>
<div style="line-height: 1.5;"><a data-custom-class="link" href="#request"><span style="color: rgb(0, 58, 250);">17. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?</span></a></div>
<div style="line-height: 1.5;"><br></div>

<div id="infocollect" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>1. WHAT INFORMATION DO WE COLLECT?</h2></span></strong>
<span data-custom-class="heading_2" id="personalinfo" style="color: rgb(0, 0, 0);"><span style="font-size: 15px;"><strong><h3>Personal information you disclose to us</h3></strong></span></span>
<span style="color: rgb(89, 89, 89); font-size: 15px;"><span data-custom-class="body_text"><strong><em>In Short:</em></strong><em> We collect personal information that you provide to us.</em></span></span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">We collect personal information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services, or otherwise when you contact us.</span></span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong>Personal Information Provided by You.</strong> The personal information that we collect depends on the context of your interactions with us and the Services, the choices you make, and the products and features you use. The personal information we collect may include the following:</span></span></div>
<ul>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);">names</span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);">email addresses</span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);">passwords</span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);">usernames</span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);">avatar image</span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);">contact preferences</span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);">profile bio / description</span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);">social login identifier</span></li>
</ul>
<div id="sensitiveinfo" style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><strong>Sensitive Information.</strong> When necessary, with your consent or as otherwise permitted by applicable law, we process the following categories of sensitive information:</span></span></div>
<ul>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">information revealing religious or philosophical beliefs</span></span></li>
</ul>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong>Social Media Login Data.</strong> We may provide you with the option to register with us using your existing social media account details, like your Facebook, X, or other social media account. If you choose to register in this way, we will collect certain profile information about you from the social media provider, as described in the section called <a data-custom-class="link" href="#sociallogins" style="color: rgb(0, 58, 250);">HOW DO WE HANDLE YOUR SOCIAL LOGINS?</a> below.</span></span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;"><strong>Application Data.</strong> If you use our application(s), we also may collect the following information if you choose to provide us with access or permission:</span></span></div>
<ul>
<li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;"><em>Geolocation Information.</em> We may request access or permission to track location-based information from your mobile device, either continuously or while you are using our mobile application(s), to provide certain location-based services. If you wish to change our access or permissions, you may do so in your device's settings.</span></span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><em>Mobile Device Data.</em> We automatically collect device information (such as your mobile device ID, model, and manufacturer), operating system, version information and system configuration information, device and application identification numbers, browser type and version, hardware model Internet service provider and/or mobile carrier, and Internet Protocol (IP) address (or proxy server). If you are using our application(s), we may also collect information about the phone network associated with your mobile device, your mobile device's operating system or platform, the type of mobile device you use, your mobile device's unique device ID, and information about the features of our application(s) you accessed.</span></span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><em>Push Notifications.</em> We may request to send you push notifications regarding your account or certain features of the application(s). If you wish to opt out from receiving these types of communications, you may turn them off in your device's settings.</span></span></li>
</ul>
<div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">This information is primarily needed to maintain the security and operation of our application(s), for troubleshooting, and for our internal analytics and reporting purposes.</span></span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">All personal information that you provide to us must be true, complete, and accurate, and you must notify us of any changes to such personal information.</span></span></div>
<div style="line-height: 1.5;"><span data-custom-class="heading_2" style="color: rgb(0, 0, 0);"><span style="font-size: 15px;"><strong><h3>Information automatically collected</h3></strong></span></span>
<span style="color: rgb(89, 89, 89); font-size: 15px;"><span data-custom-class="body_text"><strong><em>In Short:</em></strong><em> Some information — such as your Internet Protocol (IP) address and/or browser and device characteristics — is collected automatically when you visit our Services.</em></span></span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">We automatically collect certain information when you visit, use, or navigate the Services. This information does not reveal your specific identity (like your name or contact information) but may include device and usage information, such as your IP address, browser and device characteristics, operating system, language preferences, referring URLs, device name, country, location, information about how and when you use our Services, and other technical information. This information is primarily needed to maintain the security and operation of our Services, and for our internal analytics and reporting purposes.</span></span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Like many businesses, we also collect information through cookies and similar technologies.</span></span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">The information we collect includes:</span></span></div>
<ul>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><em>Log and Usage Data.</em> Log and usage data is service-related, diagnostic, usage, and performance information our servers automatically collect when you access or use our Services and which we record in log files. Depending on how you interact with us, this log data may include your IP address, device information, browser type, and settings and information about your activity in the Services (such as the date/time stamps associated with your usage, pages and files viewed, searches, and other actions you take such as which features you use), device event information (such as system activity, error reports (sometimes called "crash dumps"), and hardware settings).</span></span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><em>Device Data.</em> We collect device data such as information about your computer, phone, tablet, or other device you use to access the Services. Depending on the device used, this device data may include information such as your IP address (or proxy server), device and application identification numbers, location, browser type, hardware model, Internet service provider and/or mobile carrier, operating system, and system configuration information.</span></span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><em>Location Data.</em> We collect location data such as information about your device's location, which can be either precise or imprecise. How much information we collect depends on the type and settings of the device you use to access the Services. For example, we may use GPS and other technologies to collect geolocation data that tells us your current location (based on your IP address). You can opt out of allowing us to collect this information either by refusing access to the information or by disabling your Location setting on your device. However, if you choose to opt out, you may not be able to use certain aspects of the Services.</span></span></li>
</ul>
<div style="line-height: 1.5;"><span style="font-size: 15px;"><strong><span data-custom-class="heading_2"><h3>Google API</h3></span></strong><span data-custom-class="body_text">Our use of information received from Google APIs will adhere to </span></span><a data-custom-class="link" href="https://developers.google.com/terms/api-services-user-data-policy" rel="noopener noreferrer" target="_blank"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text">Google API Services User Data Policy</span></span></a><span style="font-size: 15px;"><span data-custom-class="body_text">, including the </span></span><a data-custom-class="link" href="https://developers.google.com/terms/api-services-user-data-policy#limited-use" rel="noopener noreferrer" target="_blank"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text">Limited Use requirements</span></span></a><span style="font-size: 15px;"><span data-custom-class="body_text">.</span></span></div>
<div style="line-height: 1.5;"><br></div>

<div id="infouse" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>2. HOW DO WE PROCESS YOUR INFORMATION?</h2></span></strong>
<span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong><em>In Short:</em></strong><em> We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes only with your prior explicit consent.</em></span></span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong>We process your personal information for a variety of reasons, depending on how you interact with our Services, including:</strong></span></span></div>
<ul>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong>To facilitate account creation and authentication and otherwise manage user accounts.</strong> We may process your information so you can create and log in to your account, as well as keep your account in working order.</span></span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong>To deliver and facilitate delivery of services to the user.</strong> We may process your information to provide you with the requested service.</span></span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong>To respond to user inquiries/offer support to users.</strong> We may process your information to respond to your inquiries and solve any potential issues you might have with the requested service.</span></span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong>To send administrative information to you.</strong> We may process your information to send you details about our products and services, changes to our terms and policies, and other similar information.</span></span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong>To enable user-to-user communications.</strong> We may process your information if you choose to use any of our offerings that allow for communication with another user.</span></span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong>To request feedback.</strong> We may process your information when necessary to request feedback and to contact you about your use of our Services.</span></span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong>To send you marketing and promotional communications.</strong> We may process the personal information you send to us for our marketing purposes, if this is in accordance with your marketing preferences. You can opt out of our marketing emails at any time. For more information, see <a data-custom-class="link" href="#privacyrights" style="color: rgb(0, 58, 250);">WHAT ARE YOUR PRIVACY RIGHTS?</a> below.</span></span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;"><strong>To protect our Services.</strong> We may process your information as part of our efforts to keep our Services safe and secure, including fraud monitoring and prevention.</span></span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;"><strong>To identify usage trends.</strong> We may process information about how you use our Services to better understand how they are being used so we can improve them.</span></span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><strong>To determine the effectiveness of our marketing and promotional campaigns.</strong> We may process your information to better understand how to provide marketing and promotional campaigns that are most relevant to you.</span></span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;"><strong>To save or protect an individual's vital interest.</strong> We may process your information when necessary to save or protect an individual's vital interest, such as to prevent harm.</span></span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><strong>To sync your practice data across your devices.</strong> We sync your enrolled plans, completion progress, saved recitations, practice routine, and mantra accumulations across iOS, Android, and Web so your practice continues seamlessly when you switch devices.</span></span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><strong>To deliver scheduled reminders for your practice routine.</strong> When you set up a daily practice routine with reminder times, we schedule local notifications on your device to prompt you at those times.</span></span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;"><strong>To ground AI responses in authentic Buddhist texts.</strong> We process the text of user queries to the AI chat assistant to retrieve and surface relevant passages from authentic Buddhist canonical texts and partner-licensed teachings.</span></span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;"><strong>To improve the quality and accuracy of multilingual translations.</strong> We use aggregated usage data and user-reported corrections to identify translation issues across our supported languages (English, Tibetan, Chinese, and additional languages we add over time).</span></span></li>
</ul>
<div style="line-height: 1.5;"><br></div>

<div id="legalbases" style="line-height: 1.5;"><strong><span style="font-size: 15px;"><span data-custom-class="heading_1"><h2>3. WHAT LEGAL BASES DO WE RELY ON TO PROCESS YOUR INFORMATION?</h2></span></span></strong>
<em><span style="font-size: 15px;"><span data-custom-class="body_text"><strong>In Short:</strong> We only process your personal information when we believe it is necessary and we have a valid legal reason (i.e., legal basis) to do so under applicable law, like with your consent, to comply with laws, to provide you with services to enter into or fulfill our contractual obligations, to protect your rights, or to fulfill our legitimate business interests.</span></span></em></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><em><span style="font-size: 15px;"><span data-custom-class="body_text"><strong><u>If you are located in the EU or UK, this section applies to you.</u></strong></span></span></em></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">The General Data Protection Regulation (GDPR) and UK GDPR require us to explain the valid legal bases we rely on in order to process your personal information. As such, we may rely on the following legal bases to process your personal information:</span></span></div>
<ul>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><strong>Consent.</strong> We may process your information if you have given us permission (i.e., consent) to use your personal information for a specific purpose. You can withdraw your consent at any time. Learn more about <a data-custom-class="link" href="#withdrawconsent" style="color: rgb(0, 58, 250);">withdrawing your consent</a>.</span></span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;"><strong>Performance of a Contract.</strong> We may process your personal information when we believe it is necessary to fulfill our contractual obligations to you, including providing our Services or at your request prior to entering into a contract with you.</span></span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;"><strong>Legitimate Interests.</strong> We may process your information when we believe it is reasonably necessary to achieve our legitimate business interests and those interests do not outweigh your interests and fundamental rights and freedoms. For example, we may process your personal information for some of the purposes described in order to:</span></span></li>
</ul>
<ul style="margin-left: 40px;">
<li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;">Send users information about special offers and discounts on our products and services</span></span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;">Analyze how our Services are used so we can improve them to engage and retain users</span></span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;">Support our marketing activities</span></span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;">Diagnose problems and/or prevent fraudulent activities</span></span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;">Understand how our users use our products and services so we can improve user experience</span></span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;">Provide a trustworthy AI assistant that supports rather than misleads Buddhist practitioners, and to prevent inaccurate or fabricated spiritual content.</span></span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;">Make authentic Buddhist teachings accessible across languages while maintaining accuracy and respect for the source material.</span></span></li>
</ul>
<ul>
<li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;"><strong>Legal Obligations.</strong> We may process your information where we believe it is necessary for compliance with our legal obligations, such as to cooperate with a law enforcement body or regulatory agency, exercise or defend our legal rights, or disclose your information as evidence in litigation in which we are involved.</span></span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;"><strong>Vital Interests.</strong> We may process your information where we believe it is necessary to protect your vital interests or the vital interests of a third party, such as situations involving potential threats to the safety of any person.</span></span></li>
</ul>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;"><strong><u><em>If you are located in Canada, this section applies to you.</em></u></strong></span></span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;">We may process your information if you have given us specific permission (i.e., express consent) to use your personal information for a specific purpose, or in situations where your permission can be inferred (i.e., implied consent). You can <a data-custom-class="link" href="#withdrawconsent" style="color: rgb(0, 58, 250);">withdraw your consent</a> at any time.</span></span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;">In some exceptional cases, we may be legally permitted under applicable law to process your information without your consent, including, for example:</span></span></div>
<ul>
<li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;">If collection is clearly in the interests of an individual and consent cannot be obtained in a timely way</span></span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;">For investigations and fraud detection and prevention</span></span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;">For business transactions provided certain conditions are met</span></span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;">If it is contained in a witness statement and the collection is necessary to assess, process, or settle an insurance claim</span></span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;">For identifying injured, ill, or deceased persons and communicating with next of kin</span></span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;">If we have reasonable grounds to believe an individual has been, is, or may be victim of financial abuse</span></span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;">If it is reasonable to expect collection and use with consent would compromise the availability or the accuracy of the information and the collection is reasonable for purposes related to investigating a breach of an agreement or a contravention of the laws of Canada or a province</span></span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;">If disclosure is required to comply with a subpoena, warrant, court order, or rules of the court relating to the production of records</span></span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">If it was produced by an individual in the course of their employment, business, or profession and the collection is consistent with the purposes for which the information was produced</span></span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">If the collection is solely for journalistic, artistic, or literary purposes</span></span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">If the information is publicly available and is specified by the regulations</span></span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;">We may disclose de-identified information for approved research or statistics projects, subject to ethics oversight and confidentiality commitments</span></li>
</ul>
<div style="line-height: 1.5;"><br></div>

<div id="whoshare" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>4. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</h2></span></strong>
<span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong><em>In Short:</em></strong><em> We may share information in specific situations described in this section and/or with the following third parties.</em></span></span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><strong>Vendors, Consultants, and Other Third-Party Service Providers.</strong> We may share your data with third-party vendors, service providers, contractors, or agents ("<strong>third parties</strong>") who perform services for us or on our behalf and require access to such information to do that work. We have contracts in place with our third parties, which are designed to help safeguard your personal information. This means that they cannot do anything with your personal information unless we have instructed them to do it. They will also not share your personal information with any organization apart from us. They also commit to protect the data they hold on our behalf and to retain it for the period we instruct.</span></span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">The third parties we may share personal information with are as follows:</span></span></div>
<ul>
<li data-custom-class="body_text"><span style="font-size: 15px;"><strong>AI Service Providers</strong> — Google Cloud AI</span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><strong>Allow Users to Connect to Their Third-Party Accounts</strong> — Google account</span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><strong>Cloud Computing Services</strong> — Amazon Web Services (AWS)</span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><strong>Content Optimization</strong> — Google Fonts and YouTube video embed</span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><strong>User Account Registration and Authentication</strong> — Auth0 and Google Sign-In</span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><strong>Web and Mobile Analytics</strong> — Google Analytics for Firebase</span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><strong>Website Performance Monitoring</strong> — Firebase Crash Reporting</span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><strong>Website Testing</strong> — TestFlight and Google Play Console</span></li>
</ul>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">We also may need to share your personal information in the following situations:</span></span></div>
<ul>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><strong>Business Transfers.</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.</span></span></li>
</ul>
<div style="line-height: 1.5;"><br></div>

<div id="cookies" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>5. DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?</h2></span></strong>
<span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong><em>In Short:</em></strong><em> We may use cookies and other tracking technologies to collect and store your information.</em></span></span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">We may use cookies and similar tracking technologies (like web beacons and pixels) to gather information when you interact with our Services. Some online tracking technologies help us maintain the security of our Services and your account, prevent crashes, fix bugs, save your preferences, and assist with basic site functions.</span></span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">We also permit third parties and service providers to use online tracking technologies on our Services for analytics and advertising, including to help manage and display advertisements, to tailor advertisements to your interests, or to send abandoned shopping cart reminders (depending on your communication preferences). The third parties and service providers use their technology to provide advertising about products and services tailored to your interests which may appear either on our Services or on other websites.</span></span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">To the extent these online tracking technologies are deemed to be a "sale"/"sharing" (which includes targeted advertising, as defined under the applicable laws) under applicable US state laws, you can opt out of these online tracking technologies by submitting a request as described below under section <a data-custom-class="link" href="#uslaws" style="color: rgb(0, 58, 250);">DO UNITED STATES RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?</a></span></span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px;"><strong><span data-custom-class="heading_2"><h3>Google Analytics</h3></span></strong><span data-custom-class="body_text">We may share your information with Google Analytics to track and analyze the use of the Services. To opt out of being tracked by Google Analytics across the Services, visit <a data-custom-class="link" href="https://tools.google.com/dlpage/gaoptout" rel="noopener noreferrer" target="_blank" style="color: rgb(0, 58, 250);">https://tools.google.com/dlpage/gaoptout</a>. For more information on the privacy practices of Google, please visit the <a data-custom-class="link" href="https://policies.google.com/privacy" rel="noopener noreferrer" target="_blank" style="color: rgb(0, 58, 250);">Google Privacy &amp; Terms page</a>.</span></span></div>
<div style="line-height: 1.5;"><br></div>

<div id="ai" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>6. DO WE OFFER ARTIFICIAL INTELLIGENCE-BASED PRODUCTS?</h2></span></strong>
<strong><em><span data-custom-class="body_text">In Short:</span></em></strong><em><span data-custom-class="body_text"> We offer products, features, or tools powered by artificial intelligence, machine learning, or similar technologies.</span></em></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">As part of our Services, we offer products, features, or tools powered by artificial intelligence, machine learning, or similar technologies (collectively, "AI Products"). These tools are designed to enhance your experience and provide you with innovative solutions. The terms in this Privacy Notice govern your use of the AI Products within our Services.</span></span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px;"><strong><span data-custom-class="body_text">Use of AI Technologies</span></strong></span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">We provide the AI Products through third-party service providers ("AI Service Providers"), including Google Cloud AI. As outlined in this Privacy Notice, your input, output, and personal information will be shared with and processed by these AI Service Providers to enable your use of our AI Products for purposes outlined in <a data-custom-class="link" href="#legalbases" style="color: rgb(0, 58, 250);">WHAT LEGAL BASES DO WE RELY ON TO PROCESS YOUR PERSONAL INFORMATION?</a> You must not use the AI Products in any way that violates the terms or policies of any AI Service Provider.</span></span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px;"><strong><span data-custom-class="body_text">Our AI Products</span></strong></span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">Our AI Products are designed for the following functions:</span></span></div>
<ul>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">AI bots</span></span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">AI document generation</span></span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">AI translation</span></span></li>
</ul>
<div style="line-height: 1.5;"><span style="font-size: 15px;"><strong><span data-custom-class="body_text">How We Process Your Data Using AI</span></strong></span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">All personal information processed using our AI Products is handled in line with our Privacy Notice and our agreement with third parties. This ensures high security and safeguards your personal information throughout the process, giving you peace of mind about your data's safety.</span></span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px;"><strong><span data-custom-class="body_text">How to Opt Out</span></strong></span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">We believe in giving you the power to decide how your data is used. To opt out, you can:</span></span></div>
<ul>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">AI chat is opt-in by use — users don't trigger AI processing unless they open the AI chat feature and send a query</span></span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">Users can delete their AI chat history at any time from within the app</span></span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">Server-side AI-generated content (daily summaries, translations) is part of the content delivered with study plans — opting out means not using those plans.</span></span></li>
</ul>
<div style="line-height: 1.5;"><br></div>

<div id="sociallogins" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>7. HOW DO WE HANDLE YOUR SOCIAL LOGINS?</h2></span></strong>
<span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong><em>In Short:</em></strong><em> If you choose to register or log in to our Services using a social media account, we may have access to certain information about you.</em></span></span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Our Services offer you the ability to register and log in using your third-party social media account details (like your Facebook or X logins). Where you choose to do this, we will receive certain profile information about you from your social media provider. The profile information we receive may vary depending on the social media provider concerned, but will often include your name, email address, friends list, and profile picture, as well as other information you choose to make public on such a social media platform.</span></span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">We will use the information we receive only for the purposes that are described in this Privacy Notice or that are otherwise made clear to you on the relevant Services. Please note that we do not control, and are not responsible for, other uses of your personal information by your third-party social media provider. We recommend that you review their privacy notice to understand how they collect, use, and share your personal information, and how you can set your privacy preferences on their sites and apps.</span></span></div>
<div style="line-height: 1.5;"><br></div>

<div id="intltransfers" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>8. IS YOUR INFORMATION TRANSFERRED INTERNATIONALLY?</h2></span></strong>
<span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong><em>In Short:</em></strong><em> We may transfer, store, and process your information in countries other than your own.</em></span></span></div>
<div style="line-height: 1.5;"><br></div>
<div data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Our servers are located in the United States. Regardless of your location, please be aware that your information may be transferred to, stored by, and processed by us in our facilities and in the facilities of the third parties with whom we may share your personal information (see <a data-custom-class="link" href="#whoshare" style="color: rgb(0, 58, 250);">WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</a> above), including facilities in the United States, and other countries.</span></span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">If you are a resident in the European Economic Area (EEA), United Kingdom (UK), or Switzerland, then these countries may not necessarily have data protection laws or other similar laws as comprehensive as those in your country. However, we will take all necessary measures to protect your personal information in accordance with this Privacy Notice and applicable law.</span></span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">European Commission's Standard Contractual Clauses:</span></span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">We have implemented measures to protect your personal information, including by using the European Commission's Standard Contractual Clauses for transfers of personal information between our group companies and between us and our third-party providers. These clauses require all recipients to protect all personal information that they process originating from the EEA or UK in accordance with European data protection laws and regulations. Our Standard Contractual Clauses can be provided upon request. We have implemented similar appropriate safeguards with our third-party service providers and partners and further details can be provided upon request.</span></span></div>
<div style="line-height: 1.5;"><br></div>

<div id="inforetain" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>9. HOW LONG DO WE KEEP YOUR INFORMATION?</h2></span></strong>
<span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong><em>In Short:</em></strong><em> We keep your information for as long as necessary to fulfill the purposes outlined in this Privacy Notice unless otherwise required by law.</em></span></span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">We will only keep your personal information for as long as it is necessary for the purposes set out in this Privacy Notice, unless a longer retention period is required or permitted by law (such as tax, accounting, or other legal requirements). No purpose in this notice will require us keeping your personal information for longer than the period of time in which users have an account with us.</span></span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">When we have no ongoing legitimate business need to process your personal information, we will either delete or anonymize such information, or, if this is not possible (for example, because your personal information has been stored in backup archives), then we will securely store your personal information and isolate it from any further processing until deletion is possible.</span></span></div>
<div style="line-height: 1.5;"><br></div>

<div id="infosafe" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>10. HOW DO WE KEEP YOUR INFORMATION SAFE?</h2></span></strong>
<span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong><em>In Short:</em></strong><em> We aim to protect your personal information through a system of organizational and technical security measures.</em></span></span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">We have implemented appropriate and reasonable technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other unauthorized third parties will not be able to defeat our security and improperly collect, access, steal, or modify your information. Although we will do our best to protect your personal information, transmission of personal information to and from our Services is at your own risk. You should only access the Services within a secure environment.</span></span></div>
<div style="line-height: 1.5;"><br></div>

<div id="infominors" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>11. DO WE COLLECT INFORMATION FROM MINORS?</h2></span></strong>
<span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong><em>In Short:</em></strong><em> We do not knowingly collect data from or market to children under 18 years of age or the equivalent age as specified by law in your jurisdiction.</em></span></span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">We do not knowingly collect, solicit data from, or market to children under 18 years of age or the equivalent age as specified by law in your jurisdiction, nor do we knowingly sell such personal information. By using the Services, you represent that you are at least 18 or the equivalent age as specified by law in your jurisdiction or that you are the parent or guardian of such a minor and consent to such minor dependent's use of the Services. If we learn that personal information from users less than 18 years of age or the equivalent age as specified by law in your jurisdiction has been collected, we will deactivate the account and take reasonable measures to promptly delete such data from our records. If you become aware of any data we may have collected from children under age 18 or the equivalent age as specified by law in your jurisdiction, please contact us at <a target="_blank" data-custom-class="link" href="mailto:dpo@webuddhist.com" style="color: rgb(0, 58, 250);">dpo@webuddhist.com</a>.</span></span></div>
<div style="line-height: 1.5;"><br></div>

<div id="privacyrights" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>12. WHAT ARE YOUR PRIVACY RIGHTS?</h2></span></strong>
<span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong><em>In Short:</em></strong><em> Depending on your state of residence in the US or in some regions, such as the European Economic Area (EEA), United Kingdom (UK), Switzerland, and Canada, you have rights that allow you greater access to and control over your personal information. You may review, change, or terminate your account at any time, depending on your country, province, or state of residence.</em></span></span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">In some regions (like the EEA, UK, Switzerland, and Canada), you have certain rights under applicable data protection laws. These may include the right (i) to request access and obtain a copy of your personal information, (ii) to request rectification or erasure; (iii) to restrict the processing of your personal information; (iv) if applicable, to data portability; and (v) not to be subject to automated decision-making. If a decision that produces legal or similarly significant effects is made solely by automated means, we will inform you, explain the main factors, and offer a simple way to request human review. In certain circumstances, you may also have the right to object to the processing of your personal information. You can make such a request by contacting us by using the contact details provided in the section <a data-custom-class="link" href="#contact" style="color: rgb(0, 58, 250);">HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</a> below.</span></span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">We will consider and act upon any request in accordance with applicable data protection laws.</span></span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">If you are located in the EEA or UK and you believe we are unlawfully processing your personal information, you also have the right to complain to your <a data-custom-class="link" href="https://ec.europa.eu/justice/data-protection/bodies/authorities/index_en.htm" rel="noopener noreferrer" target="_blank" style="color: rgb(0, 58, 250);">Member State data protection authority</a> or <a data-custom-class="link" href="https://ico.org.uk/make-a-complaint/data-protection-complaints/data-protection-complaints/" rel="noopener noreferrer" target="_blank" style="color: rgb(0, 58, 250);">UK data protection authority</a>.</span></span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">If you are located in Switzerland, you may contact the <a data-custom-class="link" href="https://www.edoeb.admin.ch/edoeb/en/home.html" rel="noopener noreferrer" target="_blank" style="color: rgb(0, 58, 250);">Federal Data Protection and Information Commissioner</a>.</span></span></div>
<div style="line-height: 1.5;"><br></div>
<div id="withdrawconsent" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong><u>Withdrawing your consent:</u></strong> If we are relying on your consent to process your personal information, which may be express and/or implied consent depending on the applicable law, you have the right to withdraw your consent at any time. You can withdraw your consent at any time by contacting us by using the contact details provided in the section <a data-custom-class="link" href="#contact" style="color: rgb(0, 58, 250);">HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</a> below.</span></span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">However, please note that this will not affect the lawfulness of the processing before its withdrawal nor, when applicable law allows, will it affect the processing of your personal information conducted in reliance on lawful processing grounds other than consent.</span></span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><strong><u>Opting out of marketing and promotional communications:</u></strong> You can unsubscribe from our marketing and promotional communications at any time by clicking on the unsubscribe link in the emails that we send, Leaving the WhatsApp or Line community group, Disabling notifications in your app settings, or by contacting us using the details provided in the section <a data-custom-class="link" href="#contact" style="color: rgb(0, 58, 250);">HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</a> below. You will then be removed from the marketing lists. However, we may still communicate with you — for example, to send you service-related messages that are necessary for the administration and use of your account, to respond to service requests, or for other non-marketing purposes.</span></span>
<span style="font-size: 15px;"><span data-custom-class="heading_2"><strong><h3>Account Information</h3></strong></span></span>
<span data-custom-class="body_text"><span style="font-size: 15px;">If you would at any time like to review or change the information in your account or terminate your account, you can:</span></span></div>
<ul>
<li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;">Log in to your account settings and update your user account.</span></span></li>
</ul>
<div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">Upon your request to terminate your account, we will deactivate or delete your account and information from our active databases. However, we may retain some information in our files to prevent fraud, troubleshoot problems, assist with any investigations, enforce our legal terms and/or comply with applicable legal requirements.</span></span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong><u>Cookies and similar technologies:</u></strong> Most Web browsers are set to accept cookies by default. If you prefer, you can usually choose to set your browser to remove cookies and to reject cookies. If you choose to remove cookies or reject cookies, this could affect certain features or services of our Services.</span></span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;">If you have questions or comments about your privacy rights, you may email us at <a target="_blank" data-custom-class="link" href="mailto:privacy@webuddhist.com" style="color: rgb(0, 58, 250);">privacy@webuddhist.com</a>.</span></span></div>
<div style="line-height: 1.5;"><br></div>

<div id="DNT" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>13. CONTROLS FOR DO-NOT-TRACK FEATURES</h2></span></strong>
<span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Most web browsers and some mobile operating systems and mobile applications include a Do-Not-Track ("DNT") feature or setting you can activate to signal your privacy preference not to have data about your online browsing activities monitored and collected. At this stage, no uniform technology standard for recognizing and implementing DNT signals has been finalized. As such, we do not currently respond to DNT browser signals or any other mechanism that automatically communicates your choice not to be tracked online. If a standard for online tracking is adopted that we must follow in the future, we will inform you about that practice in a revised version of this Privacy Notice.</span></span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">California law requires us to let you know how we respond to web browser DNT signals. Because there currently is not an industry or legal standard for recognizing or honoring DNT signals, we do not respond to them at this time.</span></span></div>
<div style="line-height: 1.5;"><br></div>

<div id="uslaws" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>14. DO UNITED STATES RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?</h2></span></strong>
<span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong><em>In Short:</em></strong><em> If you are a resident of California, Colorado, Connecticut, Delaware, Florida, Indiana, Iowa, Kentucky, Maryland, Minnesota, Montana, Nebraska, New Hampshire, New Jersey, Oregon, Rhode Island, Tennessee, Texas, Utah, or Virginia, you may have the right to request access to and receive details about the personal information we maintain about you and how we have processed it, correct inaccuracies, get a copy of, or delete your personal information. You may also have the right to withdraw your consent to our processing of your personal information. These rights may be limited in some circumstances by applicable law. More information is provided below.</em></span>
<strong><span data-custom-class="heading_2"><h3>Categories of Personal Information We Collect</h3></span></strong>
<span data-custom-class="body_text">The table below shows the categories of personal information we have collected in the past twelve (12) months.</span></span></div>
<div style="line-height: 1.5;"><br></div>
<table style="width: 100%;">
<thead><tr>
<th style="width: 33.8274%; border-left: 1px solid black; border-right: 1px solid black; border-top: 1px solid black; text-align: left;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong>Category</strong></span></span></th>
<th style="width: 51.4385%; border-top: 1px solid black; border-right: 1px solid black; text-align: left;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong>Examples</strong></span></span></th>
<th style="width: 14.9084%; border-right: 1px solid black; border-top: 1px solid black; text-align: left;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong>Collected</strong></span></span></th>
</tr></thead>
<tbody>
<tr><td style="border-left: 1px solid black; border-right: 1px solid black; border-top: 1px solid black;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">A. Identifiers</span></span></td><td style="border-top: 1px solid black; border-right: 1px solid black;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Contact details, such as real name, alias, postal address, telephone or mobile contact number, unique personal identifier, online identifier, Internet Protocol address, email address, and account name</span></span></td><td style="text-align: center; border-right: 1px solid black; border-top: 1px solid black;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">YES</span></span></td></tr>
<tr><td style="border-left: 1px solid black; border-right: 1px solid black; border-top: 1px solid black;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">B. Personal information as defined in the California Customer Records statute</span></span></td><td style="border-right: 1px solid black; border-top: 1px solid black;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Name, contact information, education, employment, employment history, and financial information</span></span></td><td style="text-align: center; border-right: 1px solid black; border-top: 1px solid black;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">YES</span></span></td></tr>
<tr><td style="border-left: 1px solid black; border-right: 1px solid black; border-top: 1px solid black;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">C. Protected classification characteristics under state or federal law</span></span></td><td style="border-right: 1px solid black; border-top: 1px solid black;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Gender, age, date of birth, race and ethnicity, national origin, marital status, and other demographic data</span></span></td><td style="text-align: center; border-right: 1px solid black; border-top: 1px solid black;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">YES</span></span></td></tr>
<tr><td style="border-left: 1px solid black; border-right: 1px solid black; border-top: 1px solid black;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">D. Commercial information</span></span></td><td style="border-right: 1px solid black; border-top: 1px solid black;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Transaction information, purchase history, financial details, and payment information</span></span></td><td style="text-align: center; border-right: 1px solid black; border-top: 1px solid black;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">NO</span></span></td></tr>
<tr><td style="border-left: 1px solid black; border-right: 1px solid black; border-top: 1px solid black;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">E. Biometric information</span></span></td><td style="border-right: 1px solid black; border-top: 1px solid black;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Fingerprints and voiceprints</span></span></td><td style="text-align: center; border-right: 1px solid black; border-top: 1px solid black;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">NO</span></span></td></tr>
<tr><td style="border-left: 1px solid black; border-right: 1px solid black; border-top: 1px solid black;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">F. Internet or other similar network activity</span></span></td><td style="border-right: 1px solid black; border-top: 1px solid black;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Browsing history, search history, online behavior, interest data, and interactions with our and other websites, applications, systems, and advertisements</span></span></td><td style="text-align: center; border-right: 1px solid black; border-top: 1px solid black;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">YES</span></span></td></tr>
<tr><td style="border-left: 1px solid black; border-right: 1px solid black; border-top: 1px solid black;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">G. Geolocation data</span></span></td><td style="border-right: 1px solid black; border-top: 1px solid black;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Device location</span></span></td><td style="text-align: center; border-right: 1px solid black; border-top: 1px solid black;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">YES</span></span></td></tr>
<tr><td style="border-left: 1px solid black; border-right: 1px solid black; border-top: 1px solid black;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">H. Audio, electronic, sensory, or similar information</span></span></td><td style="border-right: 1px solid black; border-top: 1px solid black;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Images and audio, video or call recordings created in connection with our business activities</span></span></td><td style="text-align: center; border-right: 1px solid black; border-top: 1px solid black;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">NO</span></span></td></tr>
<tr><td style="border-left: 1px solid black; border-right: 1px solid black; border-top: 1px solid black;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">I. Professional or employment-related information</span></span></td><td style="border-right: 1px solid black; border-top: 1px solid black;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Business contact details in order to provide you our Services at a business level or job title, work history, and professional qualifications if you apply for a job with us</span></span></td><td style="text-align: center; border-right: 1px solid black; border-top: 1px solid black;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">NO</span></span></td></tr>
<tr><td style="border-left: 1px solid black; border-right: 1px solid black; border-top: 1px solid black;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">J. Education Information</span></span></td><td style="border-right: 1px solid black; border-top: 1px solid black;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Student records and directory information</span></span></td><td style="text-align: center; border-right: 1px solid black; border-top: 1px solid black;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">NO</span></span></td></tr>
<tr><td style="border-width: 1px; border-color: black; border-style: solid;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">K. Inferences drawn from collected personal information</span></span></td><td style="border-bottom: 1px solid black; border-top: 1px solid black; border-right: 1px solid black;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Inferences drawn from any of the collected personal information listed above to create a profile or summary about, for example, an individual's preferences and characteristics</span></span></td><td style="text-align: center; border-right: 1px solid black; border-bottom: 1px solid black; border-top: 1px solid black;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">YES</span></span></td></tr>
<tr><td style="border-left: 1px solid black; border-right: 1px solid black; border-bottom: 1px solid black; line-height: 1.5;"><span data-custom-class="body_text">L. Sensitive personal Information</span></td><td style="border-right: 1px solid black; border-bottom: 1px solid black; line-height: 1.5;"><span data-custom-class="body_text">Religious or philosophical beliefs and account login information</span></td><td style="border-right: 1px solid black; border-bottom: 1px solid black; text-align: center;"><span data-custom-class="body_text">YES</span></td></tr>
</tbody>
</table>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">We only collect sensitive personal information, as defined by applicable privacy laws or the purposes allowed by law or with your consent. Sensitive personal information may be used, or disclosed to a service provider or contractor, for additional, specified purposes. You may have the right to limit the use or disclosure of your sensitive personal information. We do not collect or process sensitive personal information for the purpose of inferring characteristics about you.</span></span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">We may also collect other personal information outside of these categories through instances where you interact with us in person, online, or by phone or mail in the context of:</span></span></div>
<ul>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;">Receiving help through our customer support channels;</span></li>
<li data-custom-class="body_text"><span style="font-size: 15px;">Participation in customer surveys or contests; and</span></li>
<li data-custom-class="body_text"><span style="font-size: 15px;">Facilitation in the delivery of our Services and to respond to your inquiries.</span></li>
</ul>
<div style="line-height: 1.5;"><span data-custom-class="body_text">We will use and retain the collected personal information as needed to provide the Services or for:</span></div>
<ul>
<li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text">Category A — As long as the user has an account with us</span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text">Category B — As long as the user has an account with us</span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text">Category C — As long as the user has an account with us</span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text">Category F — 1 year</span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text">Category G — 1 year</span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text">Category K — 1 year</span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text">Category L — As long as the user has an account with us</span></li>
</ul>
<div style="line-height: 1.5;"><strong><span style="font-size: 15px;"><span data-custom-class="heading_2"><h3>Sources of Personal Information</h3></span></span></strong><span style="font-size: 15px;"><span data-custom-class="body_text">Learn more about the sources of personal information we collect in <a data-custom-class="link" href="#infocollect" style="color: rgb(0, 58, 250);">WHAT INFORMATION DO WE COLLECT?</a></span></span></div>
<div style="line-height: 1.5;"><strong><span style="font-size: 15px;"><span data-custom-class="heading_2"><h3>How We Use and Share Personal Information</h3></span></span></strong><span data-custom-class="body_text" style="font-size: 15px;">Learn more about how we use your personal information in the section <a data-custom-class="link" href="#infouse" style="color: rgb(0, 58, 250);">HOW DO WE PROCESS YOUR INFORMATION?</a></span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong>Will your information be shared with anyone else?</strong></span></span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">We may disclose your personal information with our service providers pursuant to a written contract between us and each service provider. Learn more about how we disclose personal information to in the section <a data-custom-class="link" href="#whoshare" style="color: rgb(0, 58, 250);">WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</a></span></span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">We may use your personal information for our own business purposes, such as for undertaking internal research for technological development and demonstration. This is not considered to be "selling" of your personal information.</span></span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;">We have not sold or shared any personal information to third parties for a business or commercial purpose in the preceding twelve (12) months. We have disclosed the following categories of personal information to third parties for a business or commercial purpose in the preceding twelve (12) months:</span></span></div>
<ul>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Category A. Identifiers</span></span></li>
<li data-custom-class="body_text"><span style="font-size: 15px;">Category B. Personal information as defined in the California Customer Records law</span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Category C. Characteristics of protected classifications under state or federal law</span></span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Category F. Internet or other electronic network activity information</span></span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Category G. Geolocation data</span></span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Category K. Inferences drawn from collected personal information</span></span></li>
<li data-custom-class="body_text"><span data-custom-class="body_text">Category L. Sensitive personal information</span></li>
</ul>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">The categories of third parties to whom we disclosed personal information for a business or commercial purpose can be found under <a data-custom-class="link" href="#whoshare" style="color: rgb(0, 58, 250);">WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</a></span></span></div>
<div style="line-height: 1.5;"><span style="font-size: 15px;"><strong><span data-custom-class="heading_2"><h3>Your Rights</h3></span></strong><span data-custom-class="body_text">You have rights under certain US state data protection laws. However, these rights are not absolute, and in certain cases, we may decline your request as permitted by law. These rights include:</span></span></div>
<ul>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><strong>Right to know</strong> whether or not we are processing your personal data</span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><strong>Right to access</strong> your personal data</span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><strong>Right to correct</strong> inaccuracies in your personal data</span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><strong>Right to request</strong> the deletion of your personal data</span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><strong>Right to obtain a copy</strong> of the personal data you previously shared with us</span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><strong>Right to non-discrimination</strong> for exercising your rights</span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><strong>Right to opt out</strong> of the processing of your personal data if it is used for targeted advertising (or sharing as defined under California's privacy law), the sale of personal data, or profiling in furtherance of decisions that produce legal or similarly significant effects ("profiling")</span></li>
</ul>
<div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">Depending upon the state where you live, you may also have the following rights:</span></span></div>
<ul>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;">Right to access the categories of personal data being processed (as permitted by applicable law, including the privacy law in Minnesota)</span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;">Right to obtain a list of the categories of third parties to which we have disclosed personal data (as permitted by applicable law, including the privacy law in California, Delaware, and Maryland)</span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;">Right to obtain a list of specific third parties to which we have disclosed personal data (as permitted by applicable law, including the privacy law in Minnesota and Oregon)</span></li>
<li data-custom-class="body_text" style="line-height: 1.5; font-size: 15px;">Right to obtain a list of third parties to which we have sold personal data (as permitted by applicable law, including the privacy law in Connecticut)</li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;">Right to review, understand, question, and depending on where you live, correct how personal data has been profiled (as permitted by applicable law, including the privacy law in Connecticut and Minnesota)</span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;">Right to limit use and disclosure of sensitive personal data (as permitted by applicable law, including the privacy law in California)</span></li>
<li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;">Right to opt out of the collection of sensitive data and personal data collected through the operation of a voice or facial recognition feature (as permitted by applicable law, including the privacy law in Florida)</span></li>
</ul>
<div style="line-height: 1.5;"><strong><span style="font-size: 15px;"><span data-custom-class="heading_2"><h3>How to Exercise Your Rights</h3></span></span></strong><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">To exercise these rights, you can contact us by visiting <span style="color: rgb(0, 58, 250);">webuddhist.com/privacy-request</span>, by emailing us at <a target="_blank" data-custom-class="link" href="mailto:privacy@webuddhist.com" style="color: rgb(0, 58, 250);">privacy@webuddhist.com</a>, by visiting <a target="_blank" data-custom-class="link" href="http://www.webuddhist.com/contact" style="color: rgb(0, 58, 250);">http://www.webuddhist.com/contact</a>, or by referring to the contact details at the bottom of this document.</span></span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">Under certain US state data protection laws, you can designate an authorized agent to make a request on your behalf. We may deny a request from an authorized agent that does not submit proof that they have been validly authorized to act on your behalf in accordance with applicable laws.</span></span></div>
<div style="line-height: 1.5;"><strong><span style="font-size: 15px;"><span data-custom-class="heading_2"><h3>Request Verification</h3></span></span></strong><span style="font-size: 15px;"><span data-custom-class="body_text">Upon receiving your request, we will need to verify your identity to determine you are the same person about whom we have the information in our system. We will only use personal information provided in your request to verify your identity or authority to make the request. However, if we cannot verify your identity from the information already maintained by us, we may request that you provide additional information for the purposes of verifying your identity and for security or fraud-prevention purposes.</span></span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">If you submit the request through an authorized agent, we may need to collect additional information to verify your identity before processing your request and the agent will need to provide a written and signed permission from you to submit such request on your behalf.</span></span></div>
<div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="heading_2"><strong><h3>Appeals</h3></strong></span><span data-custom-class="body_text">Under certain US state data protection laws, if we decline to take action regarding your request, you may appeal our decision by emailing us at <a target="_blank" data-custom-class="link" href="mailto:privacy@webuddhist.com" style="color: rgb(0, 58, 250);">privacy@webuddhist.com</a>. We will inform you in writing of any action taken or not taken in response to the appeal, including a written explanation of the reasons for the decisions. If your appeal is denied, you may submit a complaint to your state attorney general.</span></span></div>
<div style="line-height: 1.5;"><span style="font-size: 15px;"><strong><span data-custom-class="heading_2"><h3>California "Shine The Light" Law</h3></span></strong><span data-custom-class="body_text">California Civil Code Section 1798.83, also known as the "Shine The Light" law, permits our users who are California residents to request and obtain from us, once a year and free of charge, information about categories of personal information (if any) we disclosed to third parties for direct marketing purposes and the names and addresses of all third parties with which we shared personal information in the immediately preceding calendar year. If you are a California resident and would like to make such a request, please submit your request in writing to us by using the contact details provided in the section <a data-custom-class="link" href="#contact" style="color: rgb(0, 58, 250);">HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</a></span></span></div>
<div style="line-height: 1.5;"><br></div>

<div id="policyupdates" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>15. DO WE MAKE UPDATES TO THIS NOTICE?</h2></span></strong>
<span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><em><strong>In Short:</strong> Yes, we will update this notice as necessary to stay compliant with relevant laws.</em></span></span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">We may update this Privacy Notice from time to time. The updated version will be indicated by an updated "Revised" date at the top of this Privacy Notice. If we make material changes to this Privacy Notice, we may notify you either by prominently posting a notice of such changes or by directly sending you a notification. We encourage you to review this Privacy Notice frequently to be informed of how we are protecting your information.</span></span></div>
<div style="line-height: 1.5;"><br></div>

<div id="contact" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>16. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</h2></span></strong>
<span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">If you have questions or comments about this notice, you may contact our Data Protection Officer (DPO) by email at <a target="_blank" data-custom-class="link" href="mailto:dpo@webuddhist.com" style="color: rgb(0, 58, 250);">dpo@webuddhist.com</a>, or contact us by post at:</span></span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">OpenPecha Trust</span></span></div>
<div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">Data Protection Officer</span></span></div>
<div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">25 Blick Terrace</span></span></div>
<div style="line-height: 1.5;"><span data-custom-class="body_text">The Brook, Nelson 7010</span></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">New Zealand</span></span></div>
<div style="line-height: 1.5;"><br></div>

<div id="request" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>17. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?</h2></span></strong>
<span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">You have the right to request access to the personal information we collect from you, details about how we have processed it, correct inaccuracies, or delete your personal information. You may also have the right to withdraw your consent to our processing of your personal information. These rights may be limited in some circumstances by applicable law. To request to review, update, or delete your personal information, please visit: <span style="color: rgb(0, 58, 250);">webuddhist.com/privacy-request</span>.</span></span></div>
<div style="line-height: 1.5;"><br></div>
<div style="line-height: 1.5;"><span data-custom-class="body_text">This Privacy Policy was created using <a href="https://termly.io/products/privacy-policy-generator/" target="_blank" rel="noopener external" data-custom-class="link" style="color: rgb(0, 58, 250);">Termly's Privacy Policy Generator</a>.</span></div>
</div>
`;

const PrivacyPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy — WeBuddhist</title>
        <meta
          name="description"
          content="Privacy Policy for WeBuddhist — a non-profit Buddhist study and practice platform by OpenPecha Trust."
        />
      </Helmet>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <nav className="mb-6" aria-label="Breadcrumb">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to home
          </Link>
        </nav>
        <style>{privacyStyles}</style>
        <article
          className="privacy-policy-content"
          dangerouslySetInnerHTML={{ __html: privacyContent }}
        />
      </main>
    </>
  );
};

export default PrivacyPolicy;

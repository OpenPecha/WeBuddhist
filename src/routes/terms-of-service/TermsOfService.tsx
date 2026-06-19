import { Helmet } from "react-helmet-async";

const tosStyles = `
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
  .tos-content h1 {
    font-size: 26px;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }
  .tos-content h2 {
    font-size: 19px;
    font-weight: 700;
    margin-top: 2rem;
    margin-bottom: 0.75rem;
  }
  .tos-content h3 {
    font-size: 17px;
    font-weight: 600;
    margin-top: 1.5rem;
    margin-bottom: 0.5rem;
  }
  .tos-content ul {
    list-style-type: square;
    padding-left: 1.5rem;
    margin-bottom: 0.75rem;
  }
  .tos-content ul > li > ul {
    list-style-type: circle;
  }
  .tos-content ul > li > ul > li > ul {
    list-style-type: square;
  }
  .tos-content ol {
    padding-left: 1.5rem;
    margin-bottom: 0.75rem;
  }
  .tos-content table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1rem;
    font-size: 14px;
  }
  .tos-content td,
  .tos-content th {
    padding: 0.5rem 0.75rem;
    vertical-align: top;
  }
  bdt {
    display: inline;
  }
`;

const tosContent = `
<div data-custom-class="body">
<div><strong><span style="font-size: 26px;"><span data-custom-class="title"><h1>TERMS OF SERVICE</h1></span></span></strong></div>
<div><span style="color: rgb(127, 127, 127);"><strong><span style="font-size: 15px;"><span data-custom-class="subtitle">Last updated <bdt class="question">June 19, 2026</bdt></span></span></strong></span></div>
<div><br></div>

<div style="line-height: 1.5;"><strong><span style="font-size: 15px;"><span data-custom-class="heading_1"><h2>AGREEMENT TO OUR LEGAL TERMS</h2></span></span></strong></div>
<div><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">We operate the website <a href="https://webuddhist.com" target="_blank" data-custom-class="link">webuddhist.com</a> and the <strong>WeBuddhist</strong> mobile application (together, the "<strong>Services</strong>"), as well as any other related products and services that refer or link to these legal terms (the "<strong>Legal Terms</strong>").</span></span></div>
<div><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">WeBuddhist is a non-profit Buddhist study and practice platform funded by OpenPecha Trust. The platform provides daily reading plans, canonical texts with audio, recitations and chants, a personal practice routine builder, an AI assistant grounded in Buddhist texts, and community features.</span></span></div>
<div><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">You can contact us by email at <a href="mailto:legal@webuddhist.com" target="_blank" data-custom-class="link">legal@webuddhist.com</a> or by mail at: OpenPecha Trust, 25 Blick Terrace, The Brook, Nelson 7010, New Zealand.</span></span></div>
<div><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">These Legal Terms constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("<strong>you</strong>"), and OpenPecha Trust, concerning your access to and use of the Services. You agree that by accessing the Services, you have read, understood, and agreed to be bound by all of these Legal Terms. <strong>IF YOU DO NOT AGREE WITH ALL OF THESE LEGAL TERMS, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SERVICES AND YOU MUST DISCONTINUE USE IMMEDIATELY.</strong></span></span></div>
<div><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">We reserve the right, in our sole discretion, to make changes or modifications to these Legal Terms from time to time. We will alert you about any changes by updating the "Last updated" date of these Legal Terms. It is your responsibility to periodically review these Legal Terms to stay informed of updates.</span></span></div>
<div><br></div>

<div style="line-height: 1.5;"><strong><span style="font-size: 15px;"><span data-custom-class="heading_1"><h2>TABLE OF CONTENTS</h2></span></span></strong></div>
<div style="line-height: 1.5;">
  <ol style="color: rgb(0, 58, 250);">
    <li><a href="#services" data-custom-class="link">OUR SERVICES</a></li>
    <li><a href="#ip" data-custom-class="link">INTELLECTUAL PROPERTY RIGHTS</a></li>
    <li><a href="#userreps" data-custom-class="link">USER REPRESENTATIONS</a></li>
    <li><a href="#userreg" data-custom-class="link">USER REGISTRATION</a></li>
    <li><a href="#prohibited" data-custom-class="link">PROHIBITED ACTIVITIES</a></li>
    <li><a href="#ugc" data-custom-class="link">USER GENERATED CONTRIBUTIONS</a></li>
    <li><a href="#license" data-custom-class="link">CONTRIBUTION LICENSE</a></li>
    <li><a href="#mobile" data-custom-class="link">MOBILE APPLICATION LICENSE</a></li>
    <li><a href="#thirdparty" data-custom-class="link">THIRD-PARTY WEBSITES AND CONTENT</a></li>
    <li><a href="#sitemanage" data-custom-class="link">SERVICES MANAGEMENT</a></li>
    <li><a href="#privacy" data-custom-class="link">PRIVACY POLICY</a></li>
    <li><a href="#termination" data-custom-class="link">TERM AND TERMINATION</a></li>
    <li><a href="#modifications" data-custom-class="link">MODIFICATIONS AND INTERRUPTIONS</a></li>
    <li><a href="#law" data-custom-class="link">GOVERNING LAW</a></li>
    <li><a href="#disputes" data-custom-class="link">DISPUTE RESOLUTION</a></li>
    <li><a href="#disclaimer" data-custom-class="link">DISCLAIMER OF WARRANTIES</a></li>
    <li><a href="#liability" data-custom-class="link">LIMITATIONS OF LIABILITY</a></li>
    <li><a href="#indemnification" data-custom-class="link">INDEMNIFICATION</a></li>
    <li><a href="#misc" data-custom-class="link">MISCELLANEOUS</a></li>
    <li><a href="#contact" data-custom-class="link">CONTACT US</a></li>
  </ol>
</div>
<div><br></div>

<div id="services" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>1. OUR SERVICES</h2></span></strong>
<span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">The information provided when using the Services is not intended for distribution to or use by any person or entity in any jurisdiction or country where such distribution or use would be contrary to law or regulation or which would subject us to any registration requirement within such jurisdiction or country. Accordingly, those persons who choose to access the Services from other locations do so on their own initiative and are solely responsible for compliance with local laws, if and to the extent local laws are applicable.</span></span></div>
<div><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">The Services are not tailored to comply with industry-specific regulations. If your interactions would be subject to such laws, you may not use the Services.</span></span></div>
<div><br></div>
We are
<div id="ip" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>2. INTELLECTUAL PROPERTY RIGHTS</h2></span></strong>
<span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong>Our intellectual property.</strong>  the owner or the licensee of all intellectual property rights in our Services, including all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics in the Services (collectively, the "Content"), as well as the trademarks, service marks, and logos contained therein (the "Marks").</span></span></div>
<div><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Our Content and Marks are protected by copyright and trademark laws and various other intellectual property rights and unfair competition laws in New Zealand and internationally.</span></span></div>
<div><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">The Content and Marks are provided in or through the Services "AS IS" for your personal, non-commercial use or internal business purpose only. Subject to your compliance with these Legal Terms, we grant you a non-exclusive, non-transferable, revocable license to access the Services and download or print a copy of any portion of the Content solely for your personal, non-commercial use.</span></span></div>
<div><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Buddhist canonical texts and traditional teachings included in the Services may be in the public domain or used under appropriate licenses. Please contact us for clarification on specific content.</span></span></div>
<div><br></div>

<div id="userreps" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>3. USER REPRESENTATIONS</h2></span></strong>
<span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">By using the Services, you represent and warrant that: (1) all registration information you submit will be true, accurate, current, and complete; (2) you will maintain the accuracy of such information and promptly update such registration information as necessary; (3) you have the legal capacity and you agree to comply with these Legal Terms; (4) you are not a minor in the jurisdiction in which you reside, or if a minor, you have received parental permission to use the Services; (5) you will not access the Services through automated or non-human means; (6) you will not use the Services for any illegal or unauthorized purpose; and (7) your use of the Services will not violate any applicable law or regulation.</span></span></div>
<div><br></div>

<div id="userreg" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>4. USER REGISTRATION</h2></span></strong>
<span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">You may be required to register to use the Services. You agree to keep your password confidential and will be responsible for all use of your account and password. We reserve the right to remove, reclaim, or change a username you select if we determine, in our sole discretion, that such username is inappropriate, obscene, or otherwise objectionable.</span></span></div>
<div><br></div>

<div id="prohibited" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>5. PROHIBITED ACTIVITIES</h2></span></strong>
<span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">You may not access or use the Services for any purpose other than that for which we make the Services available. The Services may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.</span></span></div>
<div><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">As a user of the Services, you agree not to:</span></span></div>
<ul>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);">Systematically retrieve data or other content from the Services to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.</span></li>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);">Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information such as user passwords.</span></li>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);">Circumvent, disable, or otherwise interfere with security-related features of the Services.</span></li>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);">Disparage, tarnish, or otherwise harm, in our opinion, us and/or the Services.</span></li>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);">Use any information obtained from the Services in order to harass, abuse, or harm another person.</span></li>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);">Make improper use of our support services or submit false reports of abuse or misconduct.</span></li>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);">Use the Services in a manner inconsistent with any applicable laws or regulations.</span></li>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);">Engage in unauthorized framing of or linking to the Services.</span></li>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);">Upload or transmit (or attempt to upload or to transmit) viruses, Trojan horses, or other material that interferes with any party's uninterrupted use and enjoyment of the Services.</span></li>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);">Delete the copyright or other proprietary rights notice from any Content.</span></li>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);">Attempt to impersonate another user or person or use the username of another user.</span></li>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);">Interfere with, disrupt, or create an undue burden on the Services or the networks or services connected to the Services.</span></li>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);">Harass, annoy, intimidate, or threaten any of our employees or agents engaged in providing any portion of the Services to you.</span></li>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);">Attempt to bypass any measures of the Services designed to prevent or restrict access to the Services, or any portion of the Services.</span></li>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);">Use the AI assistant feature to generate content that misrepresents Buddhist teachings or is harmful, offensive, or misleading.</span></li>
</ul>
<div><br></div>

<div id="ugc" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>6. USER GENERATED CONTRIBUTIONS</h2></span></strong>
<span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">The Services may invite you to chat, contribute to, or participate in blogs, message boards, online forums, and other functionality, and may provide you with the opportunity to create, submit, post, display, transmit, perform, publish, distribute, or broadcast content and materials to us or on the Services, including but not limited to text, writings, video, audio, photographs, graphics, comments, suggestions, or personal information or other material (collectively, "Contributions").</span></span></div>
<div><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">By posting Contributions, you represent and warrant that your Contributions do not violate the rights of any third party, are not defamatory or harmful, comply with applicable laws, and are consistent with respectful discourse around Buddhist teachings and practice.</span></span></div>
<div><br></div>

<div id="license" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>7. CONTRIBUTION LICENSE</h2></span></strong>
<span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">By posting your Contributions to any part of the Services, you automatically grant us an unrestricted, unlimited, irrevocable, perpetual, non-exclusive, transferable, royalty-free, fully-paid, worldwide right and license to host, use, copy, reproduce, disclose, sell, resell, publish, broadcast, retitle, archive, store, cache, publicly perform, publicly display, reformat, translate, transmit, excerpt (in whole or in part), and distribute such Contributions for any purpose, commercial, advertising, or otherwise, and to prepare derivative works of, or incorporate into other works, such Contributions.</span></span></div>
<div><br></div>

<div id="mobile" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>8. MOBILE APPLICATION LICENSE</h2></span></strong>
<span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong>Use License.</strong> If you access the Services via the App, then we grant you a revocable, non-exclusive, non-transferable, limited right to install and use the App on wireless electronic devices owned or controlled by you, and to access and use the App on such devices strictly in accordance with the terms and conditions of this mobile application license contained in these Legal Terms.</span></span></div>
<div><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">You shall not: (1) except as permitted by applicable law, decompile, reverse engineer, disassemble, attempt to derive the source code of, or decrypt the App; (2) make any modification, adaptation, improvement, enhancement, translation, or derivative work from the App; (3) violate any applicable laws, rules, or regulations in connection with your access or use of the App; (4) remove, alter, or obscure any proprietary notice (including any notice of copyright or trademark) posted by us or the licensors of the App; (5) use the App for any revenue generating endeavor, commercial enterprise, or other purpose for which it is not designed or intended; (6) make the App available over a network or other environment permitting access or use by multiple devices or users at the same time; (7) use the App for creating a product, service, or software that is, directly or indirectly, competitive with or in any way a substitute for the App; (8) use the App to send automated queries to any website or to send any unsolicited commercial email.</span></span></div>
<div><br></div>

<div id="thirdparty" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>9. THIRD-PARTY WEBSITES AND CONTENT</h2></span></strong>
<span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">The Services may contain (or you may be sent via the Services) links to other websites ("Third-Party Websites") as well as articles, photographs, text, graphics, pictures, designs, music, sound, video, information, applications, software, and other content or items belonging to or originating from third parties ("Third-Party Content"). Such Third-Party Websites and Third-Party Content are not investigated, monitored, or checked for accuracy, appropriateness, or completeness by us, and we are not responsible for any Third-Party Websites accessed through the Services or any Third-Party Content posted on, available through, or installed from the Services.</span></span></div>
<div><br></div>

<div id="sitemanage" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>10. SERVICES MANAGEMENT</h2></span></strong>
<span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">We reserve the right, but not the obligation, to: (1) monitor the Services for violations of these Legal Terms; (2) take appropriate legal action against anyone who, in our sole discretion, violates the law or these Legal Terms, including without limitation, reporting such user to law enforcement authorities; (3) in our sole discretion and without limitation, refuse, restrict access to, limit the availability of, or disable (to the extent technologically feasible) any of your Contributions or any portion thereof; (4) in our sole discretion and without limitation, notice, or liability, to remove from the Services or otherwise disable all files and content that are excessive in size or are in any way burdensome to our systems; and (5) otherwise manage the Services in a manner designed to protect our rights and property and to facilitate the proper functioning of the Services.</span></span></div>
<div><br></div>

<div id="privacy" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>11. PRIVACY POLICY</h2></span></strong>
<span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">We care about data privacy and security. Please review our Privacy Policy at <a href="/privacy-policy" data-custom-class="link">webuddhist.com/privacy-policy</a>. By using the Services, you agree to be bound by our Privacy Policy, which is incorporated into these Legal Terms. Please be advised the Services are hosted in New Zealand. We do not knowingly accept, request, or solicit information from children under 13 years of age.</span></span></div>
<div><br></div>

<div id="termination" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>12. TERM AND TERMINATION</h2></span></strong>
<span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">These Legal Terms shall remain in full force and effect while you use the Services. WITHOUT LIMITING ANY OTHER PROVISION OF THESE LEGAL TERMS, WE RESERVE THE RIGHT TO, IN OUR SOLE DISCRETION AND WITHOUT NOTICE OR LIABILITY, DENY ACCESS TO AND USE OF THE SERVICES (INCLUDING BLOCKING CERTAIN IP ADDRESSES), TO ANY PERSON FOR ANY REASON OR FOR NO REASON, INCLUDING WITHOUT LIMITATION FOR BREACH OF ANY REPRESENTATION, WARRANTY, OR COVENANT CONTAINED IN THESE LEGAL TERMS OR OF ANY APPLICABLE LAW OR REGULATION.</span></span></div>
<div><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">If we terminate or suspend your account for any reason, you are prohibited from registering and creating a new account under your name, a fake or borrowed name, or the name of any third party. In addition to terminating or suspending your account, we reserve the right to take appropriate legal action, including without limitation pursuing civil, criminal, and injunctive redress.</span></span></div>
<div><br></div>

<div id="modifications" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>13. MODIFICATIONS AND INTERRUPTIONS</h2></span></strong>
<span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">We reserve the right to change, modify, or remove the contents of the Services at any time or for any reason at our sole discretion without notice. We will not be liable to you or any third party for any modification, suspension, or discontinuance of the Services.</span></span></div>
<div><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">We cannot guarantee the Services will be available at all times. We may experience hardware, software, or other problems or need to perform maintenance related to the Services, resulting in interruptions, delays, or errors. We reserve the right to change, revise, update, suspend, discontinue, or otherwise modify the Services at any time or for any reason without notice to you.</span></span></div>
<div><br></div>

<div id="law" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>14. GOVERNING LAW</h2></span></strong>
<span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">These Legal Terms shall be governed by and defined following the laws of New Zealand. OpenPecha Trust and yourself irrevocably consent that the courts of New Zealand shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these Legal Terms.</span></span></div>
<div><br></div>

<div id="disputes" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>15. DISPUTE RESOLUTION</h2></span></strong>
<span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong>Informal Negotiations.</strong> To expedite resolution and control the cost of any dispute, controversy, or claim related to these Legal Terms (each a "Dispute" and collectively, the "Disputes"), the parties agree to first attempt to negotiate any Dispute (except those Disputes expressly provided below) informally for at least thirty (30) days before initiating arbitration. Such informal negotiations commence upon written notice from one party to the other party.</span></span></div>
<div><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong>Binding Arbitration.</strong> Any dispute arising out of or in connection with these Legal Terms, including any question regarding its existence, validity, or termination, shall be referred to and finally resolved by arbitration administered under the rules of the New Zealand Arbitration Act 1996.</span></span></div>
<div><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong>Restrictions.</strong> The parties agree that any arbitration shall be limited to the Dispute between the parties individually. To the full extent permitted by law, (a) no arbitration shall be joined with any other proceeding; (b) there is no right or authority for any Dispute to be arbitrated on a class-action basis or to utilize class action procedures; and (c) there is no right or authority for any Dispute to be brought in a purported representative capacity on behalf of the general public or any other persons.</span></span></div>
<div><br></div>

<div id="disclaimer" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>16. DISCLAIMER OF WARRANTIES</h2></span></strong>
<span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">THE SERVICES ARE PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF THE SERVICES WILL BE AT YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, IN CONNECTION WITH THE SERVICES AND YOUR USE THEREOF, INCLUDING, WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE MAKE NO WARRANTIES OR REPRESENTATIONS ABOUT THE ACCURACY OR COMPLETENESS OF THE SERVICES' CONTENT OR THE CONTENT OF ANY WEBSITES OR MOBILE APPLICATIONS LINKED TO THE SERVICES AND WE WILL ASSUME NO LIABILITY OR RESPONSIBILITY FOR ANY ERRORS, MISTAKES, OR INACCURACIES OF CONTENT AND MATERIALS.</span></span></div>
<div><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">The AI assistant feature is provided for informational and educational purposes only. It does not constitute religious advice, and we make no warranty that its outputs are complete, accurate, or authoritative representations of Buddhist teachings.</span></span></div>
<div><br></div>

<div id="liability" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>17. LIMITATIONS OF LIABILITY</h2></span></strong>
<span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFIT, LOST REVENUE, LOSS OF DATA, OR OTHER DAMAGES ARISING FROM YOUR USE OF THE SERVICES, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.</span></span></div>
<div><br></div>

<div id="indemnification" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>18. INDEMNIFICATION</h2></span></strong>
<span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">You agree to defend, indemnify, and hold us harmless, including our subsidiaries, affiliates, and all of our respective officers, agents, partners, and employees, from and against any loss, damage, liability, claim, or demand, including reasonable attorneys' fees and expenses, made by any third party due to or arising out of: (1) your Contributions; (2) use of the Services; (3) breach of these Legal Terms; (4) any breach of your representations and warranties set forth in these Legal Terms; (5) your violation of the rights of a third party, including but not limited to intellectual property rights; or (6) any overt harmful act toward any other user of the Services with whom you connected via the Services.</span></span></div>
<div><br></div>

<div id="misc" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>19. MISCELLANEOUS</h2></span></strong>
<span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">These Legal Terms and any policies or operating rules posted by us on the Services or in respect to the Services constitute the entire agreement and understanding between you and us. Our failure to exercise or enforce any right or provision of these Legal Terms shall not operate as a waiver of such right or provision. These Legal Terms operate to the fullest extent permissible by law. We may assign any or all of our rights and obligations to others at any time. We shall not be responsible or liable for any loss, damage, delay, or failure to act caused by any cause beyond our reasonable control. If any provision or part of a provision of these Legal Terms is determined to be unlawful, void, or unenforceable, that provision or part of the provision is deemed severable from these Legal Terms and does not affect the validity and enforceability of any remaining provisions.</span></span></div>
<div><br></div>

<div id="contact" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>20. CONTACT US</h2></span></strong>
<span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">In order to resolve a complaint regarding the Services or to receive further information regarding use of the Services, please contact us at:</span></span></div>
<div><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong>OpenPecha Trust</strong></span></span></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">25 Blick Terrace</span></span></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">The Brook, Nelson 7010</span></span></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">New Zealand</span></span></div>
<div><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Email: <a href="mailto:legal@webuddhist.com" target="_blank" data-custom-class="link">legal@webuddhist.com</a></span></span></div>
</div>
`;

const TermsOfService = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service — WeBuddhist</title>
        <meta
          name="description"
          content="Terms of Service for WeBuddhist — a non-profit Buddhist study and practice platform by OpenPecha Trust."
        />
      </Helmet>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <style>{tosStyles}</style>
        <article
          className="tos-content"
          dangerouslySetInnerHTML={{ __html: tosContent }}
        />
      </main>
    </>
  );
};

export default TermsOfService;

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
<div><span style="color: rgb(127, 127, 127);"><strong><span style="font-size: 15px;"><span data-custom-class="subtitle">Last updated June 25, 2026</span></span></strong></span></div>
<div><br></div>

<div style="line-height: 1.5;"><strong><span style="font-size: 15px;"><span data-custom-class="heading_1"><h2>AGREEMENT TO OUR LEGAL TERMS</h2></span></span></strong></div>
<div><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">We are <strong>Dharmaduta Services LLP</strong> (<strong>"Company,"</strong> <strong>"we,"</strong> <strong>"us,"</strong> <strong>"our"</strong>), a company registered in India at Trehan Cottage, H. 112, Ward 3, Khara Danda Road, Dharamshala, Distt. Kangra, Himachal Pradesh 176215.</span></span></div>
<div><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">We operate the mobile application <strong>WeBuddhist</strong> (the <strong>"App"</strong>), as well as any other related products and services that refer or link to these legal terms (the <strong>"Legal Terms"</strong>) (collectively, the <strong>"Services"</strong>).</span></span></div>
<div><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">WeBuddhist is a mobile application (available on iOS and Android) designed to support Buddhist practitioners in their daily practice and spiritual learning. The app features a digital mala (prayer bead) counter for tracking mantra recitations, with counts synced to the cloud across devices. Users can read Buddhist texts through an immersive reader, follow personalized practice plans, and build daily practice routines. A meditation timer with preset options supports sitting sessions, and a dedicated recitation feature guides users through structured recitation practice. The app also includes a Tibetan lunar calendar that displays lunar dates and upcoming Buddhist observance days. An AI chat assistant lets users ask questions and explore Buddhist teachings, drawing on sourced content from the text library. Community features allow users to discover and join groups, and view group profiles to connect with other practitioners. A notifications system keeps users informed about practice reminders and updates. The app supports six languages: English, Tibetan, Chinese, Hindi, Mongolian, and Nepali. Browsing is available without an account; signing in unlocks cloud sync, progress saving, personalized content, and community features.</span></span></div>
<div><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">You can contact us by phone at <strong>+91-9902472664</strong>, email at <a target="_blank" data-custom-class="link" href="mailto:contact@dharmaduta.in">contact@dharmaduta.in</a>, or by mail to Trehan Cottage, H. 112, Ward 3, Khara Danda Road, Dharamshala, Distt. Kangra, Himachal Pradesh 176215, India.</span></span></div>
<div><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">These Legal Terms constitute a legally binding agreement made between you, whether personally or on behalf of an entity (<strong>"you"</strong>), and Dharmaduta Services LLP, concerning your access to and use of the Services. You agree that by accessing the Services, you have read, understood, and agreed to be bound by all of these Legal Terms. <strong>IF YOU DO NOT AGREE WITH ALL OF THESE LEGAL TERMS, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SERVICES AND YOU MUST DISCONTINUE USE IMMEDIATELY.</strong></span></span></div>
<div><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Supplemental terms and conditions or documents that may be posted on the Services from time to time are hereby expressly incorporated herein by reference. We reserve the right, in our sole discretion, to make changes or modifications to these Legal Terms from time to time. We will alert you about any changes by updating the "Last updated" date of these Legal Terms, and you waive any right to receive specific notice of each such change. It is your responsibility to periodically review these Legal Terms to stay informed of updates. You will be subject to, and will be deemed to have been made aware of and to have accepted, the changes in any revised Legal Terms by your continued use of the Services after the date such revised Legal Terms are posted.</span></span></div>
<div><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">All users who are minors in the jurisdiction in which they reside (generally under the age of 18) must have the permission of, and be directly supervised by, their parent or guardian to use the Services. If you are a minor, you must have your parent or guardian read and agree to these Legal Terms prior to you using the Services.</span></span></div>
<div><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">We recommend that you print a copy of these Legal Terms for your records.</span></span></div>
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
    <li><a href="#socialmedia" data-custom-class="link">SOCIAL MEDIA</a></li>
    <li><a href="#thirdparty" data-custom-class="link">THIRD-PARTY WEBSITES AND CONTENT</a></li>
    <li><a href="#sitemanage" data-custom-class="link">SERVICES MANAGEMENT</a></li>
    <li><a href="#ppyes" data-custom-class="link">PRIVACY POLICY</a></li>
    <li><a href="#copyrightyes" data-custom-class="link">COPYRIGHT INFRINGEMENTS</a></li>
    <li><a href="#terms" data-custom-class="link">TERM AND TERMINATION</a></li>
    <li><a href="#modifications" data-custom-class="link">MODIFICATIONS AND INTERRUPTIONS</a></li>
    <li><a href="#law" data-custom-class="link">GOVERNING LAW</a></li>
    <li><a href="#disputes" data-custom-class="link">DISPUTE RESOLUTION</a></li>
    <li><a href="#corrections" data-custom-class="link">CORRECTIONS</a></li>
    <li><a href="#disclaimer" data-custom-class="link">DISCLAIMER</a></li>
    <li><a href="#liability" data-custom-class="link">LIMITATIONS OF LIABILITY</a></li>
    <li><a href="#indemnification" data-custom-class="link">INDEMNIFICATION</a></li>
    <li><a href="#userdata" data-custom-class="link">USER DATA</a></li>
    <li><a href="#electronic" data-custom-class="link">ELECTRONIC COMMUNICATIONS, TRANSACTIONS, AND SIGNATURES</a></li>
    <li><a href="#california" data-custom-class="link">CALIFORNIA USERS AND RESIDENTS</a></li>
    <li><a href="#misc" data-custom-class="link">MISCELLANEOUS</a></li>
    <li><a href="#contact" data-custom-class="link">CONTACT US</a></li>
  </ol>
</div>
<div><br></div>

<div id="services" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>1. OUR SERVICES</h2></span></strong></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">The information provided when using the Services is not intended for distribution to or use by any person or entity in any jurisdiction or country where such distribution or use would be contrary to law or regulation or which would subject us to any registration requirement within such jurisdiction or country. Accordingly, those persons who choose to access the Services from other locations do so on their own initiative and are solely responsible for compliance with local laws, if and to the extent local laws are applicable.</span></span></div>
<div><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">The Services are not tailored to comply with industry-specific regulations (Health Insurance Portability and Accountability Act (HIPAA), Federal Information Security Management Act (FISMA), etc.), so if your interactions would be subjected to such laws, you may not use the Services. You may not use the Services in a way that would violate the Gramm-Leach-Bliley Act (GLBA).</span></span></div>
<div><br></div>

<div id="ip" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>2. INTELLECTUAL PROPERTY RIGHTS</h2></span></strong></div>
<div style="line-height: 1.5;"><strong><span data-custom-class="heading_2"><h3>Our intellectual property</h3></span></strong></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">We are the owner or the licensee of all intellectual property rights in our Services, including all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics in the Services (collectively, the "Content"), as well as the trademarks, service marks, and logos contained therein (the "Marks").</span></span></div>
<div><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Our Content and Marks are protected by copyright and trademark laws (and various other intellectual property rights and unfair competition laws) and treaties in the United States and around the world.</span></span></div>
<div><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">The Content and Marks are provided in or through the Services "AS IS" for your personal, non-commercial use or internal business purpose only.</span></span></div>
<div style="line-height: 1.5;"><strong><span data-custom-class="heading_2"><h3>Your use of our Services</h3></span></strong></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Subject to your compliance with these Legal Terms, including the <a data-custom-class="link" href="#prohibited" style="color: rgb(0, 58, 250);">PROHIBITED ACTIVITIES</a> section below, we grant you a non-exclusive, non-transferable, revocable license to:</span></span></div>
<ul>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);">access the Services; and</span></li>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);">download or print a copy of any portion of the Content to which you have properly gained access,</span></li>
</ul>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">solely for your personal, non-commercial use or internal business purpose.</span></span></div>
<div><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Except as set out in this section or elsewhere in our Legal Terms, no part of the Services and no Content or Marks may be copied, reproduced, aggregated, republished, uploaded, posted, publicly displayed, encoded, translated, transmitted, distributed, sold, licensed, or otherwise exploited for any commercial purpose whatsoever, without our express prior written permission.</span></span></div>
<div><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">If you wish to make any use of the Services, Content, or Marks other than as set out in this section or elsewhere in our Legal Terms, please address your request to: <a target="_blank" data-custom-class="link" href="mailto:contact@dharmaduta.in">contact@dharmaduta.in</a>. If we ever grant you the permission to post, reproduce, or publicly display any part of our Services or Content, you must identify us as the owners or licensors of the Services, Content, or Marks and ensure that any copyright or proprietary notice appears or is visible on posting, reproducing, or displaying our Content.</span></span></div>
<div><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">We reserve all rights not expressly granted to you in and to the Services, Content, and Marks.</span></span></div>
<div><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Any breach of these Intellectual Property Rights will constitute a material breach of our Legal Terms and your right to use our Services will terminate immediately.</span></span></div>
<div style="line-height: 1.5;"><strong><span data-custom-class="heading_2"><h3>Your submissions and contributions</h3></span></strong></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Please review this section and the <a data-custom-class="link" href="#prohibited" style="color: rgb(0, 58, 250);">PROHIBITED ACTIVITIES</a> section carefully prior to using our Services to understand the (a) rights you give us and (b) obligations you have when you post or upload any content through the Services.</span></span></div>
<div><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong>Submissions:</strong> By directly sending us any question, comment, suggestion, idea, feedback, or other information about the Services ("Submissions"), you agree to assign to us all intellectual property rights in such Submission. You agree that we shall own this Submission and be entitled to its unrestricted use and dissemination for any lawful purpose, commercial or otherwise, without acknowledgment or compensation to you.</span></span></div>
<div><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong>Contributions:</strong> The Services may invite you to chat, contribute to, or participate in blogs, message boards, online forums, and other functionality during which you may create, submit, post, display, transmit, publish, distribute, or broadcast content and materials to us or through the Services, including but not limited to text, writings, video, audio, photographs, music, graphics, comments, reviews, rating suggestions, personal information, or other material ("Contributions"). Any Submission that is publicly posted shall also be treated as a Contribution.</span></span></div>
<div><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">You understand that Contributions may be viewable by other users of the Services and possibly through third-party websites.</span></span></div>
<div><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong>When you post Contributions, you grant us a license (including use of your name, trademarks, and logos):</strong> By posting any Contributions, you grant us an unrestricted, unlimited, irrevocable, perpetual, non-exclusive, transferable, royalty-free, fully-paid, worldwide right, and license to: use, copy, reproduce, distribute, sell, resell, publish, broadcast, retitle, store, publicly perform, publicly display, reformat, translate, excerpt (in whole or in part), and exploit your Contributions (including, without limitation, your image, name, and voice) for any purpose, commercial, advertising, or otherwise, to prepare derivative works of, or incorporate into other works, your Contributions, and to sublicense the licenses granted in this section. Our use and distribution may occur in any media formats and through any media channels.</span></span></div>
<div><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">This license includes our use of your name, company name, and franchise name, as applicable, and any of the trademarks, service marks, trade names, logos, and personal and commercial images you provide.</span></span></div>
<div><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong>You are responsible for what you post or upload:</strong> By sending us Submissions and/or posting Contributions through any part of the Services or making Contributions accessible through the Services by linking your account through the Services to any of your social networking accounts, you:</span></span></div>
<ul>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);">confirm that you have read and agree with our <a data-custom-class="link" href="#prohibited" style="color: rgb(0, 58, 250);">PROHIBITED ACTIVITIES</a> and will not post, send, publish, upload, or transmit through the Services any Submission nor post any Contribution that is illegal, harassing, hateful, harmful, defamatory, obscene, bullying, abusive, discriminatory, threatening to any person or group, sexually explicit, false, inaccurate, deceitful, or misleading;</span></li>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);">to the extent permissible by applicable law, waive any and all moral rights to any such Submission and/or Contribution;</span></li>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);">warrant that any such Submission and/or Contributions are original to you or that you have the necessary rights and licenses to submit such Submissions and/or Contributions and that you have full authority to grant us the above-mentioned rights in relation to your Submissions and/or Contributions; and</span></li>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);">warrant and represent that your Submissions and/or Contributions do not constitute confidential information.</span></li>
</ul>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">You are solely responsible for your Submissions and/or Contributions and you expressly agree to reimburse us for any and all losses that we may suffer because of your breach of (a) this section, (b) any third party's intellectual property rights, or (c) applicable law.</span></span></div>
<div><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong>We may remove or edit your Content:</strong> Although we have no obligation to monitor any Contributions, we shall have the right to remove or edit any Contributions at any time without notice if in our reasonable opinion we consider such Contributions harmful or in breach of these Legal Terms. If we remove or edit any such Contributions, we may also suspend or disable your account and report you to the authorities.</span></span></div>
<div style="line-height: 1.5;"><strong><span data-custom-class="heading_2"><h3>Copyright infringement</h3></span></strong></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">We respect the intellectual property rights of others. If you believe that any material available on or through the Services infringes upon any copyright you own or control, please immediately refer to the <a data-custom-class="link" href="#copyrightyes" style="color: rgb(0, 58, 250);">COPYRIGHT INFRINGEMENTS</a> section below.</span></span></div>
<div><br></div>

<div id="userreps" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>3. USER REPRESENTATIONS</h2></span></strong></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">By using the Services, you represent and warrant that: (1) all registration information you submit will be true, accurate, current, and complete; (2) you will maintain the accuracy of such information and promptly update such registration information as necessary; (3) you have the legal capacity and you agree to comply with these Legal Terms; (4) you are not a minor in the jurisdiction in which you reside, or if a minor, you have received parental permission to use the Services; (5) you will not access the Services through automated or non-human means, whether through a bot, script or otherwise; (6) you will not use the Services for any illegal or unauthorized purpose; and (7) your use of the Services will not violate any applicable law or regulation.</span></span></div>
<div><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">If you provide any information that is untrue, inaccurate, not current, or incomplete, we have the right to suspend or terminate your account and refuse any and all current or future use of the Services (or any portion thereof).</span></span></div>
<div><br></div>

<div id="userreg" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>4. USER REGISTRATION</h2></span></strong></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">You may be required to register to use the Services. You agree to keep your password confidential and will be responsible for all use of your account and password. We reserve the right to remove, reclaim, or change a username you select if we determine, in our sole discretion, that such username is inappropriate, obscene, or otherwise objectionable.</span></span></div>
<div><br></div>

<div id="prohibited" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>5. PROHIBITED ACTIVITIES</h2></span></strong></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">You may not access or use the Services for any purpose other than that for which we make the Services available. The Services may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.</span></span></div>
<div><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">As a user of the Services, you agree not to:</span></span></div>
<ul>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);">Systematically retrieve data or other content from the Services to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.</span></li>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);">Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information such as user passwords.</span></li>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);">Circumvent, disable, or otherwise interfere with security-related features of the Services, including features that prevent or restrict the use or copying of any Content or enforce limitations on the use of the Services and/or the Content contained therein.</span></li>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);">Disparage, tarnish, or otherwise harm, in our opinion, us and/or the Services.</span></li>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);">Use any information obtained from the Services in order to harass, abuse, or harm another person.</span></li>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);">Make improper use of our support services or submit false reports of abuse or misconduct.</span></li>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);">Use the Services in a manner inconsistent with any applicable laws or regulations.</span></li>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);">Engage in unauthorized framing of or linking to the Services.</span></li>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);">Upload or transmit (or attempt to upload or to transmit) viruses, Trojan horses, or other material, including excessive use of capital letters and spamming (continuous posting of repetitive text), that interferes with any party's uninterrupted use and enjoyment of the Services or modifies, impairs, disrupts, alters, or interferes with the use, features, functions, operation, or maintenance of the Services.</span></li>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);">Engage in any automated use of the system, such as using scripts to send comments or messages, or using any data mining, robots, or similar data gathering and extraction tools.</span></li>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);">Delete the copyright or other proprietary rights notice from any Content.</span></li>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);">Attempt to impersonate another user or person or use the username of another user.</span></li>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);">Upload or transmit (or attempt to upload or to transmit) any material that acts as a passive or active information collection or transmission mechanism, including without limitation, clear graphics interchange formats ("gifs"), 1x1 pixels, web bugs, cookies, or other similar devices (sometimes referred to as "spyware" or "passive collection mechanisms" or "pcms").</span></li>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);">Interfere with, disrupt, or create an undue burden on the Services or the networks or services connected to the Services.</span></li>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);">Harass, annoy, intimidate, or threaten any of our employees or agents engaged in providing any portion of the Services to you.</span></li>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);">Attempt to bypass any measures of the Services designed to prevent or restrict access to the Services, or any portion of the Services.</span></li>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);">Copy or adapt the Services' software, including but not limited to Flash, PHP, HTML, JavaScript, or other code.</span></li>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);">Except as permitted by applicable law, decipher, decompile, disassemble, or reverse engineer any of the software comprising or in any way making up a part of the Services.</span></li>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);">Except as may be the result of standard search engine or Internet browser usage, use, launch, develop, or distribute any automated system, including without limitation, any spider, robot, cheat utility, scraper, or offline reader that accesses the Services, or use or launch any unauthorized script or other software.</span></li>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);">Use a buying agent or purchasing agent to make purchases on the Services.</span></li>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);">Make any unauthorized use of the Services, including collecting usernames and/or email addresses of users by electronic or other means for the purpose of sending unsolicited email, or creating user accounts by automated means or under false pretenses.</span></li>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);">Use the Services as part of any effort to compete with us or otherwise use the Services and/or the Content for any revenue-generating endeavor or commercial enterprise.</span></li>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);">Use the Services to advertise or offer to sell goods and services.</span></li>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);">Sell or otherwise transfer your profile.</span></li>
</ul>
<div><br></div>

<div id="ugc" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>6. USER GENERATED CONTRIBUTIONS</h2></span></strong></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">The Services may invite you to chat, contribute to, or participate in blogs, message boards, online forums, and other functionality, and may provide you with the opportunity to create, submit, post, display, transmit, perform, publish, distribute, or broadcast content and materials to us or on the Services, including but not limited to text, writings, video, audio, photographs, graphics, comments, suggestions, or personal information or other material (collectively, "Contributions"). Contributions may be viewable by other users of the Services and through third-party websites. As such, any Contributions you transmit may be treated as non-confidential and non-proprietary. When you create or make available any Contributions, you thereby represent and warrant that:</span></span></div>
<ul>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 14px; color: rgb(89, 89, 89);">The creation, distribution, transmission, public display, or performance, and the accessing, downloading, or copying of your Contributions do not and will not infringe the proprietary rights, including but not limited to the copyright, patent, trademark, trade secret, or moral rights of any third party.</span></li>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 14px; color: rgb(89, 89, 89);">You are the creator and owner of or have the necessary licenses, rights, consents, releases, and permissions to use and to authorize us, the Services, and other users of the Services to use your Contributions in any manner contemplated by the Services and these Legal Terms.</span></li>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 14px; color: rgb(89, 89, 89);">You have the written consent, release, and/or permission of each and every identifiable individual person in your Contributions to use the name or likeness of each and every such identifiable individual person to enable inclusion and use of your Contributions in any manner contemplated by the Services and these Legal Terms.</span></li>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 14px; color: rgb(89, 89, 89);">Your Contributions are not false, inaccurate, or misleading.</span></li>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 14px; color: rgb(89, 89, 89);">Your Contributions are not unsolicited or unauthorized advertising, promotional materials, pyramid schemes, chain letters, spam, mass mailings, or other forms of solicitation.</span></li>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 14px; color: rgb(89, 89, 89);">Your Contributions are not obscene, lewd, lascivious, filthy, violent, harassing, libelous, slanderous, or otherwise objectionable (as determined by us).</span></li>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 14px; color: rgb(89, 89, 89);">Your Contributions do not ridicule, mock, disparage, intimidate, or abuse anyone.</span></li>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 14px; color: rgb(89, 89, 89);">Your Contributions are not used to harass or threaten (in the legal sense of those terms) any other person and to promote violence against a specific person or class of people.</span></li>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 14px; color: rgb(89, 89, 89);">Your Contributions do not violate any applicable law, regulation, or rule.</span></li>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 14px; color: rgb(89, 89, 89);">Your Contributions do not violate the privacy or publicity rights of any third party.</span></li>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 14px; color: rgb(89, 89, 89);">Your Contributions do not violate any applicable law concerning child pornography, or otherwise intended to protect the health or well-being of minors.</span></li>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 14px; color: rgb(89, 89, 89);">Your Contributions do not include any offensive comments that are connected to race, national origin, gender, sexual preference, or physical handicap.</span></li>
  <li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 14px; color: rgb(89, 89, 89);">Your Contributions do not otherwise violate, or link to material that violates, any provision of these Legal Terms, or any applicable law or regulation.</span></li>
</ul>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Any use of the Services in violation of the foregoing violates these Legal Terms and may result in, among other things, termination or suspension of your rights to use the Services.</span></span></div>
<div><br></div>

<div id="license" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>7. CONTRIBUTION LICENSE</h2></span></strong></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">By posting your Contributions to any part of the Services or making Contributions accessible to the Services by linking your account from the Services to any of your social networking accounts, you automatically grant, and you represent and warrant that you have the right to grant, to us an unrestricted, unlimited, irrevocable, perpetual, non-exclusive, transferable, royalty-free, fully-paid, worldwide right, and license to host, use, copy, reproduce, disclose, sell, resell, publish, broadcast, retitle, archive, store, cache, publicly perform, publicly display, reformat, translate, transmit, excerpt (in whole or in part), and distribute such Contributions (including, without limitation, your image and voice) for any purpose, commercial, advertising, or otherwise, and to prepare derivative works of, or incorporate into other works, such Contributions, and grant and authorize sublicenses of the foregoing. The use and distribution may occur in any media formats and through any media channels.</span></span></div>
<div><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">This license will apply to any form, media, or technology now known or hereafter developed, and includes our use of your name, company name, and franchise name, as applicable, and any of the trademarks, service marks, trade names, logos, and personal and commercial images you provide. You waive all moral rights in your Contributions, and you warrant that moral rights have not otherwise been asserted in your Contributions.</span></span></div>
<div><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">We do not assert any ownership over your Contributions. You retain full ownership of all of your Contributions and any intellectual property rights or other proprietary rights associated with your Contributions. We are not liable for any statements or representations in your Contributions provided by you in any area on the Services. You are solely responsible for your Contributions to the Services and you expressly agree to exonerate us from any and all responsibility and to refrain from any legal action against us regarding your Contributions.</span></span></div>
<div><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">We have the right, in our sole and absolute discretion, (1) to edit, redact, or otherwise change any Contributions; (2) to re-categorize any Contributions to place them in more appropriate locations on the Services; and (3) to pre-screen or delete any Contributions at any time and for any reason, without notice. We have no obligation to monitor your Contributions.</span></span></div>
<div><br></div>

<div id="mobile" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>8. MOBILE APPLICATION LICENSE</h2></span></strong></div>
<div style="line-height: 1.5;"><strong><span data-custom-class="heading_2"><h3>Use License</h3></span></strong></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">If you access the Services via the App, then we grant you a revocable, non-exclusive, non-transferable, limited right to install and use the App on wireless electronic devices owned or controlled by you, and to access and use the App on such devices strictly in accordance with the terms and conditions of this mobile application license contained in these Legal Terms. You shall not: (1) except as permitted by applicable law, decompile, reverse engineer, disassemble, attempt to derive the source code of, or decrypt the App; (2) make any modification, adaptation, improvement, enhancement, translation, or derivative work from the App; (3) violate any applicable laws, rules, or regulations in connection with your access or use of the App; (4) remove, alter, or obscure any proprietary notice (including any notice of copyright or trademark) posted by us or the licensors of the App; (5) use the App for any revenue-generating endeavor, commercial enterprise, or other purpose for which it is not designed or intended; (6) make the App available over a network or other environment permitting access or use by multiple devices or users at the same time; (7) use the App for creating a product, service, or software that is, directly or indirectly, competitive with or in any way a substitute for the App; (8) use the App to send automated queries to any website or to send any unsolicited commercial email; or (9) use any proprietary information or any of our interfaces or our other intellectual property in the design, development, manufacture, licensing, or distribution of any applications, accessories, or devices for use with the App.</span></span></div>
<div style="line-height: 1.5;"><strong><span data-custom-class="heading_2"><h3>Apple and Android Devices</h3></span></strong></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">The following terms apply when you use the App obtained from either the Apple Store or Google Play (each an "App Distributor") to access the Services: (1) the license granted to you for our App is limited to a non-transferable license to use the application on a device that utilizes the Apple iOS or Android operating systems, as applicable, and in accordance with the usage rules set forth in the applicable App Distributor's terms of service; (2) we are responsible for providing any maintenance and support services with respect to the App as specified in the terms and conditions of this mobile application license contained in these Legal Terms or as otherwise required under applicable law, and you acknowledge that each App Distributor has no obligation whatsoever to furnish any maintenance and support services with respect to the App; (3) in the event of any failure of the App to conform to any applicable warranty, you may notify the applicable App Distributor, and the App Distributor, in accordance with its terms and policies, may refund the purchase price, if any, paid for the App, and to the maximum extent permitted by applicable law, the App Distributor will have no other warranty obligation whatsoever with respect to the App; (4) you represent and warrant that (i) you are not located in a country that is subject to a US government embargo, or that has been designated by the US government as a "terrorist supporting" country and (ii) you are not listed on any US government list of prohibited or restricted parties; (5) you must comply with applicable third-party terms of agreement when using the App; and (6) you acknowledge and agree that the App Distributors are third-party beneficiaries of the terms and conditions in this mobile application license contained in these Legal Terms, and that each App Distributor will have the right (and will be deemed to have accepted the right) to enforce the terms and conditions in this mobile application license contained in these Legal Terms against you as a third-party beneficiary thereof.</span></span></div>
<div><br></div>

<div id="socialmedia" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>9. SOCIAL MEDIA</h2></span></strong></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">As part of the functionality of the Services, you may link your account with online accounts you have with third-party service providers (each such account, a "Third-Party Account") by either: (1) providing your Third-Party Account login information through the Services; or (2) allowing us to access your Third-Party Account, as is permitted under the applicable terms and conditions that govern your use of each Third-Party Account. You represent and warrant that you are entitled to disclose your Third-Party Account login information to us and/or grant us access to your Third-Party Account, without breach by you of any of the terms and conditions that govern your use of the applicable Third-Party Account, and without obligating us to pay any fees or making us subject to any usage limitations imposed by the third-party service provider of the Third-Party Account. By granting us access to any Third-Party Accounts, you understand that (1) we may access, make available, and store (if applicable) any content that you have provided to and stored in your Third-Party Account (the "Social Network Content") so that it is available on and through the Services via your account, including without limitation any friend lists and (2) we may submit to and receive from your Third-Party Account additional information to the extent you are notified when you link your account with the Third-Party Account. Depending on the Third-Party Accounts you choose and subject to the privacy settings that you have set in such Third-Party Accounts, personally identifiable information that you post to your Third-Party Accounts may be available on and through your account on the Services. Please note that if a Third-Party Account or associated service becomes unavailable or our access to such Third-Party Account is terminated by the third-party service provider, then Social Network Content may no longer be available on and through the Services. You will have the ability to disable the connection between your account on the Services and your Third-Party Accounts at any time. PLEASE NOTE THAT YOUR RELATIONSHIP WITH THE THIRD-PARTY SERVICE PROVIDERS ASSOCIATED WITH YOUR THIRD-PARTY ACCOUNTS IS GOVERNED SOLELY BY YOUR AGREEMENT(S) WITH SUCH THIRD-PARTY SERVICE PROVIDERS. We make no effort to review any Social Network Content for any purpose, including but not limited to, for accuracy, legality, or non-infringement, and we are not responsible for any Social Network Content. You acknowledge and agree that we may access your email address book associated with a Third-Party Account and your contacts list stored on your mobile device or tablet computer solely for purposes of identifying and informing you of those contacts who have also registered to use the Services. You can deactivate the connection between the Services and your Third-Party Account by contacting us using the contact information below or through your account settings (if applicable). We will attempt to delete any information stored on our servers that was obtained through such Third-Party Account, except the username and profile picture that become associated with your account.</span></span></div>
<div><br></div>

<div id="thirdparty" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>10. THIRD-PARTY WEBSITES AND CONTENT</h2></span></strong></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">The Services may contain (or you may be sent via the App) links to other websites ("Third-Party Websites") as well as articles, photographs, text, graphics, pictures, designs, music, sound, video, information, applications, software, and other content or items belonging to or originating from third parties ("Third-Party Content"). Such Third-Party Websites and Third-Party Content are not investigated, monitored, or checked for accuracy, appropriateness, or completeness by us, and we are not responsible for any Third-Party Websites accessed through the Services or any Third-Party Content posted on, available through, or installed from the Services, including the content, accuracy, offensiveness, opinions, reliability, privacy practices, or other policies of or contained in the Third-Party Websites or the Third-Party Content. Inclusion of, linking to, or permitting the use or installation of any Third-Party Websites or any Third-Party Content does not imply approval or endorsement thereof by us. If you decide to leave the Services and access the Third-Party Websites or to use or install any Third-Party Content, you do so at your own risk, and you should be aware these Legal Terms no longer govern. You should review the applicable terms and policies, including privacy and data gathering practices, of any website to which you navigate from the Services or relating to any applications you use or install from the Services. Any purchases you make through Third-Party Websites will be through other websites and from other companies, and we take no responsibility whatsoever in relation to such purchases which are exclusively between you and the applicable third party. You agree and acknowledge that we do not endorse the products or services offered on Third-Party Websites and you shall hold us blameless from any harm caused by your purchase of such products or services. Additionally, you shall hold us blameless from any losses sustained by you or harm caused to you relating to or resulting in any way from any Third-Party Content or any contact with Third-Party Websites.</span></span></div>
<div><br></div>

<div id="sitemanage" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>11. SERVICES MANAGEMENT</h2></span></strong></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">We reserve the right, but not the obligation, to: (1) monitor the Services for violations of these Legal Terms; (2) take appropriate legal action against anyone who, in our sole discretion, violates the law or these Legal Terms, including without limitation, reporting such user to law enforcement authorities; (3) in our sole discretion and without limitation, refuse, restrict access to, limit the availability of, or disable (to the extent technologically feasible) any of your Contributions or any portion thereof; (4) in our sole discretion and without limitation, notice, or liability, to remove from the Services or otherwise disable all files and content that are excessive in size or are in any way burdensome to our systems; and (5) otherwise manage the Services in a manner designed to protect our rights and property and to facilitate the proper functioning of the Services.</span></span></div>
<div><br></div>

<div id="ppyes" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>12. PRIVACY POLICY</h2></span></strong></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">We care about data privacy and security. Please review our Privacy Policy: <strong><a target="_blank" data-custom-class="link" href="https://webuddhist.com/privacy-policy">https://webuddhist.com/privacy-policy</a></strong>. By using the Services, you agree to be bound by our Privacy Policy, which is incorporated into these Legal Terms. Please be advised the Services are hosted in India. If you access the Services from any other region of the world with laws or other requirements governing personal data collection, use, or disclosure that differ from applicable laws in India, then through your continued use of the Services, you are transferring your data to India, and you expressly consent to have your data transferred to and processed in India.</span></span></div>
<div><br></div>

<div id="copyrightyes" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>13. COPYRIGHT INFRINGEMENTS</h2></span></strong></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">We respect the intellectual property rights of others. If you believe that any material available on or through the Services infringes upon any copyright you own or control, please immediately notify us using the contact information provided below (a "Notification"). A copy of your Notification will be sent to the person who posted or stored the material addressed in the Notification. Please be advised that pursuant to applicable law you may be held liable for damages if you make material misrepresentations in a Notification. Thus, if you are not sure that material located on or linked to by the Services infringes your copyright, you should consider first contacting an attorney.</span></span></div>
<div><br></div>

<div id="terms" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>14. TERM AND TERMINATION</h2></span></strong></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">These Legal Terms shall remain in full force and effect while you use the Services. WITHOUT LIMITING ANY OTHER PROVISION OF THESE LEGAL TERMS, WE RESERVE THE RIGHT TO, IN OUR SOLE DISCRETION AND WITHOUT NOTICE OR LIABILITY, DENY ACCESS TO AND USE OF THE SERVICES (INCLUDING BLOCKING CERTAIN IP ADDRESSES), TO ANY PERSON FOR ANY REASON OR FOR NO REASON, INCLUDING WITHOUT LIMITATION FOR BREACH OF ANY REPRESENTATION, WARRANTY, OR COVENANT CONTAINED IN THESE LEGAL TERMS OR OF ANY APPLICABLE LAW OR REGULATION. WE MAY TERMINATE YOUR USE OR PARTICIPATION IN THE SERVICES OR DELETE YOUR ACCOUNT AND ANY CONTENT OR INFORMATION THAT YOU POSTED AT ANY TIME, WITHOUT WARNING, IN OUR SOLE DISCRETION.</span></span></div>
<div><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">If we terminate or suspend your account for any reason, you are prohibited from registering and creating a new account under your name, a fake or borrowed name, or the name of any third party, even if you may be acting on behalf of the third party. In addition to terminating or suspending your account, we reserve the right to take appropriate legal action, including without limitation pursuing civil, criminal, and injunctive redress.</span></span></div>
<div><br></div>

<div id="modifications" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>15. MODIFICATIONS AND INTERRUPTIONS</h2></span></strong></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">We reserve the right to change, modify, or remove the contents of the Services at any time or for any reason at our sole discretion without notice. However, we have no obligation to update any information on our Services. We will not be liable to you or any third party for any modification, price change, suspension, or discontinuance of the Services.</span></span></div>
<div><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">We cannot guarantee the Services will be available at all times. We may experience hardware, software, or other problems or need to perform maintenance related to the Services, resulting in interruptions, delays, or errors. We reserve the right to change, revise, update, suspend, discontinue, or otherwise modify the Services at any time or for any reason without notice to you. You agree that we have no liability whatsoever for any loss, damage, or inconvenience caused by your inability to access or use the Services during any downtime or discontinuance of the Services. Nothing in these Legal Terms will be construed to obligate us to maintain and support the Services or to supply any corrections, updates, or releases in connection therewith.</span></span></div>
<div><br></div>

<div id="law" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>16. GOVERNING LAW</h2></span></strong></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">These Legal Terms shall be governed by and defined following the laws of India. Dharmaduta Services LLP and yourself irrevocably consent that the courts of India shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these Legal Terms.</span></span></div>
<div><br></div>

<div id="disputes" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>17. DISPUTE RESOLUTION</h2></span></strong></div>
<div style="line-height: 1.5;"><strong><span data-custom-class="heading_2"><h3>Informal Negotiations</h3></span></strong></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">To expedite resolution and control the cost of any dispute, controversy, or claim related to these Legal Terms (each a "Dispute" and collectively, the "Disputes") brought by either you or us (individually, a "Party" and collectively, the "Parties"), the Parties agree to first attempt to negotiate any Dispute (except those Disputes expressly provided below) informally for at least thirty (30) days before initiating arbitration. Such informal negotiations commence upon written notice from one Party to the other Party.</span></span></div>
<div style="line-height: 1.5;"><strong><span data-custom-class="heading_2"><h3>Binding Arbitration</h3></span></strong></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">If the parties are unable to resolve the dispute through informal negotiation, the dispute shall be finally resolved by arbitration in accordance with the United Nations Commission on International Trade Law Arbitration Rules in force at the time of commencement of the arbitration. The number of arbitrators shall be two (2). The seat, or legal place, of arbitration shall be Delhi, India. The language of the proceedings shall be English. The governing law of these Legal Terms shall be substantive law of India.</span></span></div>
<div style="line-height: 1.5;"><strong><span data-custom-class="heading_2"><h3>Restrictions</h3></span></strong></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">The Parties agree that any arbitration shall be limited to the Dispute between the Parties individually. To the full extent permitted by law, (a) no arbitration shall be joined with any other proceeding; (b) there is no right or authority for any Dispute to be arbitrated on a class-action basis or to utilize class action procedures; and (c) there is no right or authority for any Dispute to be brought in a purported representative capacity on behalf of the general public or any other persons.</span></span></div>
<div style="line-height: 1.5;"><strong><span data-custom-class="heading_2"><h3>Exceptions to Informal Negotiations and Arbitration</h3></span></strong></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">The Parties agree that the following Disputes are not subject to the above provisions concerning informal negotiations and binding arbitration: (a) any Disputes seeking to enforce or protect, or concerning the validity of, any of the intellectual property rights of a Party; (b) any Dispute related to, or arising from, allegations of theft, piracy, invasion of privacy, or unauthorized use; and (c) any claim for injunctive relief. If this provision is found to be illegal or unenforceable, then neither Party will elect to arbitrate any Dispute falling within that portion of this provision found to be illegal or unenforceable and such Dispute shall be decided by a court of competent jurisdiction within the courts listed for jurisdiction above, and the Parties agree to submit to the personal jurisdiction of that court.</span></span></div>
<div><br></div>

<div id="corrections" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>18. CORRECTIONS</h2></span></strong></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">There may be information on the Services that contains typographical errors, inaccuracies, or omissions, including descriptions, pricing, availability, and various other information. We reserve the right to correct any errors, inaccuracies, or omissions and to change or update the information on the Services at any time, without prior notice.</span></span></div>
<div><br></div>

<div id="disclaimer" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>19. DISCLAIMER</h2></span></strong></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">THE SERVICES ARE PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF THE SERVICES WILL BE AT YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, IN CONNECTION WITH THE SERVICES AND YOUR USE THEREOF, INCLUDING, WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE MAKE NO WARRANTIES OR REPRESENTATIONS ABOUT THE ACCURACY OR COMPLETENESS OF THE SERVICES' CONTENT OR THE CONTENT OF ANY WEBSITES OR MOBILE APPLICATIONS LINKED TO THE SERVICES AND WE WILL ASSUME NO LIABILITY OR RESPONSIBILITY FOR ANY (1) ERRORS, MISTAKES, OR INACCURACIES OF CONTENT AND MATERIALS, (2) PERSONAL INJURY OR PROPERTY DAMAGE, OF ANY NATURE WHATSOEVER, RESULTING FROM YOUR ACCESS TO AND USE OF THE SERVICES, (3) ANY UNAUTHORIZED ACCESS TO OR USE OF OUR SECURE SERVERS AND/OR ANY AND ALL PERSONAL INFORMATION AND/OR FINANCIAL INFORMATION STORED THEREIN, (4) ANY INTERRUPTION OR CESSATION OF TRANSMISSION TO OR FROM THE SERVICES, (5) ANY BUGS, VIRUSES, TROJAN HORSES, OR THE LIKE WHICH MAY BE TRANSMITTED TO OR THROUGH THE SERVICES BY ANY THIRD PARTY, AND/OR (6) ANY ERRORS OR OMISSIONS IN ANY CONTENT AND MATERIALS OR FOR ANY LOSS OR DAMAGE OF ANY KIND INCURRED AS A RESULT OF THE USE OF ANY CONTENT POSTED, TRANSMITTED, OR OTHERWISE MADE AVAILABLE VIA THE SERVICES. WE DO NOT WARRANT, ENDORSE, GUARANTEE, OR ASSUME RESPONSIBILITY FOR ANY PRODUCT OR SERVICE ADVERTISED OR OFFERED BY A THIRD PARTY THROUGH THE SERVICES, ANY HYPERLINKED WEBSITE, OR ANY WEBSITE OR MOBILE APPLICATION FEATURED IN ANY BANNER OR OTHER ADVERTISING, AND WE WILL NOT BE A PARTY TO OR IN ANY WAY BE RESPONSIBLE FOR MONITORING ANY TRANSACTION BETWEEN YOU AND ANY THIRD-PARTY PROVIDERS OF PRODUCTS OR SERVICES. AS WITH THE PURCHASE OF A PRODUCT OR SERVICE THROUGH ANY MEDIUM OR IN ANY ENVIRONMENT, YOU SHOULD USE YOUR BEST JUDGMENT AND EXERCISE CAUTION WHERE APPROPRIATE.</span></span></div>
<div><br></div>

<div id="liability" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>20. LIMITATIONS OF LIABILITY</h2></span></strong></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFIT, LOST REVENUE, LOSS OF DATA, OR OTHER DAMAGES ARISING FROM YOUR USE OF THE SERVICES, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. NOTWITHSTANDING ANYTHING TO THE CONTRARY CONTAINED HEREIN, OUR LIABILITY TO YOU FOR ANY CAUSE WHATSOEVER AND REGARDLESS OF THE FORM OF THE ACTION, WILL AT ALL TIMES BE LIMITED TO THE LESSER OF THE AMOUNT PAID, IF ANY, BY YOU TO US. CERTAIN US STATE LAWS AND INTERNATIONAL LAWS DO NOT ALLOW LIMITATIONS ON IMPLIED WARRANTIES OR THE EXCLUSION OR LIMITATION OF CERTAIN DAMAGES. IF THESE LAWS APPLY TO YOU, SOME OR ALL OF THE ABOVE DISCLAIMERS OR LIMITATIONS MAY NOT APPLY TO YOU, AND YOU MAY HAVE ADDITIONAL RIGHTS.</span></span></div>
<div><br></div>

<div id="indemnification" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>21. INDEMNIFICATION</h2></span></strong></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">You agree to defend, indemnify, and hold us harmless, including our subsidiaries, affiliates, and all of our respective officers, agents, partners, and employees, from and against any loss, damage, liability, claim, or demand, including reasonable attorneys' fees and expenses, made by any third party due to or arising out of: (1) your Contributions; (2) use of the Services; (3) breach of these Legal Terms; (4) any breach of your representations and warranties set forth in these Legal Terms; (5) your violation of the rights of a third party, including but not limited to intellectual property rights; or (6) any overt harmful act toward any other user of the Services with whom you connected via the Services. Notwithstanding the foregoing, we reserve the right, at your expense, to assume the exclusive defense and control of any matter for which you are required to indemnify us, and you agree to cooperate, at your expense, with our defense of such claims. We will use reasonable efforts to notify you of any such claim, action, or proceeding which is subject to this indemnification upon becoming aware of it.</span></span></div>
<div><br></div>

<div id="userdata" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>22. USER DATA</h2></span></strong></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">We will maintain certain data that you transmit to the Services for the purpose of managing the performance of the Services, as well as data relating to your use of the Services. Although we perform regular routine backups of data, you are solely responsible for all data that you transmit or that relates to any activity you have undertaken using the Services. You agree that we shall have no liability to you for any loss or corruption of any such data, and you hereby waive any right of action against us arising from any such loss or corruption of such data.</span></span></div>
<div><br></div>

<div id="electronic" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>23. ELECTRONIC COMMUNICATIONS, TRANSACTIONS, AND SIGNATURES</h2></span></strong></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Visiting the Services, sending us emails, and completing online forms constitute electronic communications. You consent to receive electronic communications, and you agree that all agreements, notices, disclosures, and other communications we provide to you electronically, via email and on the Services, satisfy any legal requirement that such communication be in writing. YOU HEREBY AGREE TO THE USE OF ELECTRONIC SIGNATURES, CONTRACTS, ORDERS, AND OTHER RECORDS, AND TO ELECTRONIC DELIVERY OF NOTICES, POLICIES, AND RECORDS OF TRANSACTIONS INITIATED OR COMPLETED BY US OR VIA THE SERVICES. You hereby waive any rights or requirements under any statutes, regulations, rules, ordinances, or other laws in any jurisdiction which require an original signature or delivery or retention of non-electronic records, or to payments or the granting of credits by any means other than electronic means.</span></span></div>
<div><br></div>

<div id="california" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>24. CALIFORNIA USERS AND RESIDENTS</h2></span></strong></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">If any complaint with us is not satisfactorily resolved, you can contact the Complaint Assistance Unit of the Division of Consumer Services of the California Department of Consumer Affairs in writing at 1625 North Market Blvd., Suite N 112, Sacramento, California 95834 or by telephone at (800) 952-5210 or (916) 445-1254.</span></span></div>
<div><br></div>

<div id="misc" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>25. MISCELLANEOUS</h2></span></strong></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">These Legal Terms and any policies or operating rules posted by us on the Services or in respect to the Services constitute the entire agreement and understanding between you and us. Our failure to exercise or enforce any right or provision of these Legal Terms shall not operate as a waiver of such right or provision. These Legal Terms operate to the fullest extent permissible by law. We may assign any or all of our rights and obligations to others at any time. We shall not be responsible or liable for any loss, damage, delay, or failure to act caused by any cause beyond our reasonable control. If any provision or part of a provision of these Legal Terms is determined to be unlawful, void, or unenforceable, that provision or part of the provision is deemed severable from these Legal Terms and does not affect the validity and enforceability of any remaining provisions. There is no joint venture, partnership, employment or agency relationship created between you and us as a result of these Legal Terms or use of the Services. You agree that these Legal Terms will not be construed against us by virtue of having drafted them. You hereby waive any and all defenses you may have based on the electronic form of these Legal Terms and the lack of signing by the parties hereto to execute these Legal Terms.</span></span></div>
<div><br></div>

<div id="contact" style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>26. CONTACT US</h2></span></strong></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">In order to resolve a complaint regarding the Services or to receive further information regarding use of the Services, please contact us at:</span></span></div>
<div><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong>Dharmaduta Services LLP</strong></span></span></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Trehan Cottage, H. 112, Ward 3</span></span></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Khara Danda Road, Dharamshala, Distt. Kangra</span></span></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Himachal Pradesh 176215</span></span></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">India</span></span></div>
<div><br></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong>Phone:</strong> +91-9902472664</span></span></div>
<div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong>Email:</strong> <a target="_blank" data-custom-class="link" href="mailto:contact@dharmaduta.in">contact@dharmaduta.in</a></span></span></div>
</div>
`;

const TermsOfService = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service — WeBuddhist</title>
        <meta
          name="description"
          content="Terms of Service for WeBuddhist — operated by Dharmaduta Services LLP."
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

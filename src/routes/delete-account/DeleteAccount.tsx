import { Helmet } from "react-helmet-async";

const DeleteAccount = () => {
  return (
    <>
      <Helmet>
        <title>Delete Account — WeBuddhist</title>
        <meta
          name="description"
          content="How to delete your WeBuddhist account from the mobile app."
        />
      </Helmet>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <article className="space-y-6">
          <header>
            <h1 className="text-[26px] font-bold text-black">
              Delete Your Account
            </h1>
            <p className="mt-2 text-sm text-[#595959]">
              You can permanently delete your WeBuddhist account from the mobile
              app. This action cannot be undone.
            </p>
          </header>

          <section>
            <h2 className="text-[19px] font-bold text-black mb-3">
              How to delete your account
            </h2>
            <ol className="list-decimal pl-6 space-y-2 text-sm text-[#595959] leading-relaxed">
              <li>Open the WeBuddhist app on your device.</li>
              <li>Go to Profile.</li>
              <li>Open Settings.</li>
              <li>Tap Delete Account and follow the prompts to confirm.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-[19px] font-bold text-black mb-3">
              What happens when you delete your account
            </h2>
            <p className="text-sm text-[#595959] leading-relaxed">
              Your account and associated personal data will be removed from our
              active systems. Some information may be retained where required by
              law or for legitimate business purposes, as described in our{" "}
              <a
                href="/privacy-policy"
                className="text-[#3030F1] underline underline-offset-2"
              >
                Privacy Policy
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-[19px] font-bold text-black mb-3">
              Need help?
            </h2>
            <p className="text-sm text-[#595959] leading-relaxed">
              If you are unable to access the app or need assistance deleting
              your account, contact us at{" "}
              <a
                href="mailto:privacy@webuddhist.com"
                className="text-[#3030F1] underline underline-offset-2"
              >
                privacy@webuddhist.com
              </a>
              .
            </p>
          </section>
        </article>
      </main>
    </>
  );
};

export default DeleteAccount;

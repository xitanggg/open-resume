import { Link } from "components/documentation";

const QAS = [
  {
    question:
      "Q1. What is a resume builder? Why resume builder is better than resume template doc?",
    answer: (
      <>
        <p>
          There are two ways to create a resume today. One option is to use a
          resume template, such as an office/google doc, and customize it
          according to your needs. The other option is to use a resume builder,
          an online tool that allows you to input your information and
          automatically generates a resume for you.
        </p>
        <p>
          Using a resume template requires manual formatting work, like copying
          and pasting text sections and adjusting spacing, which can be
          time-consuming and error-prone. It is easy to run into formatting
          issues, such as using different bullet points or font styles after
          copying and pasting. On the other hand, a resume builder like
          OpenResume saves time and prevents formatting mistakes by
          automatically formatting the resume. It also offers the convenience of
          easily changing font types or sizes with a simple click. In summary, a
          resume builder is easier to use compared to a resume template.
        </p>
      </>
    ),
  },
  {
    question:
      "Q2. What uniquely sets OpenResume apart from other resume builders and templates?",
    answer: (
      <>
        <p>
          Other than OpenResume, there are some great free resume builders out
          there, e.g. <Link href="https://rxresu.me/">Reactive Resume</Link>,{" "}
          <Link href="https://flowcv.com/">FlowCV</Link>. However, OpenResume
          stands out with 2 distinctive features:
        </p>{" "}
        <p>
          <span className="font-semibold">
            1. OpenResume is designed specifically for the U.S. job market and
            best practices.
          </span>
          <br />
          Unlike other resume builders that target a global audience and offer
          many customization options, OpenResume intentionally only offers
          options that are aligned with U.S. best practices. For example, it
          excludes the option to add a profile picture to avoid bias and
          discrimination. It offers only the core sections, e.g. profile, work
          experience, education, and skills, while omitting unnecessary sections
          like references. Additionally, OpenResume only offers a top down
          single column resume design as opposed to two column design, because
          single column design works best for AST. <br />{" "}
        </p>
        <p>
          <span className="font-semibold">
            2. OpenResume is super privacy focus.
          </span>{" "}
          <br />
          While other resume builders may require email sign up and store user
          data in their databases, OpenResume believes that resume data should
          remain private and accessible only on user’s local machine. Therefore,
          OpenResume doesn’t require sign up to use the app, and all inputted
          data is stored in user’s browser that only user has access to.
        </p>
      </>
    ),
  },
  {
    question: "Q3. Who created OpenResume and why?",
    answer: (
      <p>
        OpenResume was created by{" "}
        <Link href="https://github.com/xitanggg">Xitang Zhao</Link> and designed
        by <Link href="https://www.linkedin.com/in/imzhi">Zhigang Wen</Link> as
        a weekend project. As immigrants to the US, we had made many mistakes
        when creating our first resumes and applying for internships and jobs.
        It took us a long while to learn some of the best practices. While
        mentoring first generation students and reviewing their resumes, we
        noticed students were making the same mistakes that we had made before.
        This led us to think about how we can be of help with the knowledge and
        skills we have gained. We started chatting and working over the weekends
        that led to OpenResume, where we integrated best practices and our
        knowledge into this resume builder. Our hope is that OpenResume can help
        anyone to easily create a modern professional resume that follows best
        practices and enable anyone to apply for jobs with confidence.
      </p>
    ),
  },
  {
    question: "Q4. How can I support OpenResume?",
    answer: (
      <>
        <p>
          The best way to support OpenResume is to share your thoughts and
          feedback with us to help further improve it. You can send us an email
          at{" "}
          <Link href="mailto:hello@open-resume.com">hello@open-resume.com</Link>{" "}
          or{" "}
          <Link href="https://github.com/xitanggg/open-resume/issues/new">
            open an issue
          </Link>{" "}
          at our Github repository. Whether you like it or not, we would love to
          hear from you.
        </p>
        <p>
          Another great way to support OpenResume is by spreading the words.
          Share it with your friends, on social media platforms, or with your
          school’s career center. Our goal is to reach more people who struggle
          with creating their resume, and your word-of-mouth support would be
          greatly appreciated. If you use Github, you can also show your support
          by{" "}
          <Link href="https://github.com/xitanggg/open-resume">
            giving the project a star
          </Link>{" "}
          to help increase its popularity and reach.
        </p>
      </>
    ),
  },
];

export const QuestionsAndAnswers = () => {
  return (
    <section className="mx-auto max-w-3xl divide-y divide-gray-300 lg:mt-4 lg:px-2">
      <h2 className="text-center text-3xl font-bold">Questions & Answers</h2>
      <div className="mt-6 divide-y divide-gray-300">
        {QAS.map(({ question, answer }) => (
          <div key={question} className="py-6">
            <h3 className="font-semibold leading-7">{question}</h3>
            <div className="mt-3 grid gap-2 leading-7 text-gray-600">
              {answer}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

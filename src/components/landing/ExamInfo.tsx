export default function ExamInfo() {
    return (
        <section className="py-24 bg-secondary/20 border-t border-border">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-12">
                <div className="text-center">
                    <h2 className="text-4xl font-bold text-foreground">About the LBS MCA Entrance</h2>
                    <p className="text-muted-foreground mt-3 max-w-3xl mx-auto">
                        The LBS Centre for Science & Technology conducts Kerala MCA admissions. Our program covers the entire syllabus with subject-wise classes, quizzes and full-length mock tests aligned to the latest pattern.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <div className="rounded-2xl border border-border bg-card p-6">
                        <h3 className="text-xl font-semibold text-foreground mb-2">Exam Pattern</h3>
                        <ul className="text-sm text-muted-foreground space-y-2">
                            <li>• Objective MCQs</li>
                            <li>• Subjects: CS, Mathematics & Statistics, Quantitative & Logical, English, GK</li>
                            <li>• Time-bound with negative marking (as notified)</li>
                        </ul>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-6">
                        <h3 className="text-xl font-semibold text-foreground mb-2">Eligibility</h3>
                        <ul className="text-sm text-muted-foreground space-y-2">
                            <li>• Bachelor&apos;s degree with required mathematics background</li>
                            <li>• Further criteria as per official LBS guidelines</li>
                        </ul>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-6">
                        <h3 className="text-xl font-semibold text-foreground mb-2">Why MCA?</h3>
                        <ul className="text-sm text-muted-foreground space-y-2">
                            <li>• Strong demand for software professionals</li>
                            <li>• Solid CS fundamentals and application development skills</li>
                            <li>• Opportunities in product, services, data and research</li>
                        </ul>
                    </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6">
                    <h3 className="text-xl font-semibold text-foreground mb-2">Frequently Asked Questions</h3>
                    <ul className="text-sm text-muted-foreground space-y-2">
                        <li><b>How to register?</b> Create an account, complete payment verification and wait for admin approval.</li>
                        <li><b>What is included?</b> Live classes, recorded lectures, quizzes, mock tests, previous papers and rank tracking.</li>
                        <li><b>Mobile friendly?</b> Yes, the entire platform is optimized for mobile with secure video playback.</li>
                    </ul>
                </div>
            </div>
        </section>
    );
}

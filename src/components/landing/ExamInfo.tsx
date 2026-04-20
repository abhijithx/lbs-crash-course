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
                        <h3 className="text-xl font-semibold text-foreground mb-4">Exam Pattern</h3>
                        <ul className="text-sm text-muted-foreground space-y-3">
                            <li className="flex gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span>120 Objective MCQs / 120 Marks</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span>2 Hour Duration</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span>Sections: CS (50), Math/Stat (25), Aptitude (25), English (15), GK (5)</span>
                            </li>
                        </ul>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-6">
                        <h3 className="text-xl font-semibold text-foreground mb-4">Core Syllabus</h3>
                        <ul className="text-sm text-muted-foreground space-y-3">
                            <li className="flex gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span><strong>CS:</strong> Digital logic, Data representation, CPU Architecture, C-Programming</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span><strong>Math:</strong> Algebra, Trigonometry, Coordinate Geometry, Mensuration & Probability</span>
                            </li>
                        </ul>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-6">
                        <h3 className="text-xl font-semibold text-foreground mb-4">Eligibility</h3>
                        <ul className="text-sm text-muted-foreground space-y-3">
                            <li className="flex gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span>Bachelor's degree with Mathematics/Statistics at 10+2 or Degree level</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span>Minimum 50% aggregate marks in graduation (Relaxation for reservation)</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-8">
                    <h3 className="text-2xl font-bold text-foreground mb-6">Frequently Asked Questions</h3>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <h4 className="font-bold text-foreground">How to register for the course?</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">Create an account on this platform, select your package, and complete payment verification. Our admin team will approve your access within 12-24 hours.</p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-bold text-foreground">What preparation materials are included?</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">You get access to full-length LBS-style mock tests, subject-wise quizzes, recorded video lectures, and real-time rank tracking to compare your score with competitors.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

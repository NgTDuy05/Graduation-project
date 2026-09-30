import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Exam, ExamDocument } from './schemas/exam.schema';
import { ExamAttempt, ExamAttemptDocument } from './schemas/exam-attempt.schema';
import { SubmitExamAttemptDto } from './dto/submit-exam.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserStats } from '../users/entities/user-stats.entity';

@Injectable()
export class PracticeService implements OnModuleInit {
  constructor(
    @InjectModel(Exam.name)
    private readonly examModel: Model<ExamDocument>,
    @InjectModel(ExamAttempt.name)
    private readonly attemptModel: Model<ExamAttemptDocument>,
    @InjectRepository(UserStats)
    private readonly userStatsRepository: Repository<UserStats>,
  ) {}

  async onModuleInit() {
    await this.seedInitialExamsIfEmpty();
  }

  /**
   * Tự động khởi tạo ngân hàng đề thi mẫu nếu MongoDB chưa có dữ liệu
   */
  async seedInitialExamsIfEmpty() {
    try {
      const count = await this.examModel.countDocuments();
      if (count > 0) return;

      const sampleExams = [
        {
          examId: 'de-toan-12-thpt-2026',
          title: 'Đề Thi Thử Tốt Nghiệp THPT 2026 - Môn Toán (Mã đề 101)',
          subject: 'Toán',
          grade: 12,
          durationMinutes: 45,
          totalQuestions: 6,
          description: 'Bao quát chuyên đề Khảo sát hàm số, Mũ - Logarit, Tích phân và Hình học không gian Oxyz.',
          questions: [
            {
              id: 'q1',
              question: 'Cho hàm số y = f(x) có bảng xét dấu đạo hàm f\'(x) đổi dấu từ dương sang âm khi qua điểm x = 2. Điểm x = 2 là gì của hàm số?',
              options: [
                'Điểm cực đại của hàm số',
                'Điểm cực tiểu của hàm số',
                'Giá trị lớn nhất của hàm số',
                'Điểm uốn của đồ thị hàm số',
              ],
              correctIndex: 0,
              explanation: 'Theo quy tắc 1 tìm cực trị: Khi đạo hàm f\'(x) đổi dấu từ (+) sang (-) khi qua x0 thì x0 là điểm cực đại.',
              difficulty: 'easy',
            },
            {
              id: 'q2',
              question: 'Tìm tập xác định D của hàm số y = log2(3x - 6).',
              options: [
                'D = (2; +∞)',
                'D = [2; +∞)',
                'D = (-∞; 2)',
                'D = R \\ {2}',
              ],
              correctIndex: 0,
              explanation: 'Điều kiện xác định của logarit: Biểu thức dưới dấu log phải dương: 3x - 6 > 0 <=> 3x > 6 <=> x > 2. Vậy D = (2; +∞).',
              difficulty: 'easy',
            },
            {
              id: 'q3',
              question: 'Giá trị nhỏ nhất của hàm số f(x) = x^3 - 3x + 1 trên đoạn [0; 2] bằng bao nhiêu?',
              options: ['-1', '1', '3', '0'],
              correctIndex: 0,
              explanation: 'f\'(x) = 3x^2 - 3. Cho f\'(x) = 0 <=> x = 1 (thuộc [0; 2]). Tính: f(0) = 1; f(1) = -1; f(2) = 3. Vậy giá trị nhỏ nhất là -1 tại x = 1.',
              difficulty: 'medium',
            },
            {
              id: 'q4',
              question: 'Trong không gian Oxyz, cho mặt phẳng (P): 2x - y + 3z - 5 = 0. Một vectơ pháp tuyến của (P) là:',
              options: [
                'n = (2; -1; 3)',
                'n = (2; 1; 3)',
                'n = (2; -1; -5)',
                'n = (-2; 1; 3)',
              ],
              correctIndex: 0,
              explanation: 'Mặt phẳng Ax + By + Cz + D = 0 có một vectơ pháp tuyến là n = (A; B; C) = (2; -1; 3).',
              difficulty: 'easy',
            },
            {
              id: 'q5',
              question: 'Cho hình chóp S.ABC có đáy ABC là tam giác vuông tại B, SA vuông góc với mặt phẳng (ABC). Khẳng định nào sau đây là ĐÚNG?',
              options: [
                'BC ⊥ (SAB)',
                'BC ⊥ (SAC)',
                'AC ⊥ (SAB)',
                'AB ⊥ (SBC)',
              ],
              correctIndex: 0,
              explanation: 'Ta có BC ⊥ AB (tam giác ABC vuông tại B) và BC ⊥ SA (do SA ⊥ (ABC)). Suy ra BC vuông góc với 2 đường cắt nhau trong (SAB), nên BC ⊥ (SAB).',
              difficulty: 'medium',
            },
            {
              id: 'q6',
              question: 'Tính nguyên hàm ∫ (2x + cos(x)) dx.',
              options: [
                'x^2 + sin(x) + C',
                'x^2 - sin(x) + C',
                '2x^2 + sin(x) + C',
                'x^2 + cos(x) + C',
              ],
              correctIndex: 0,
              explanation: '∫ 2x dx = x^2, và ∫ cos(x) dx = sin(x). Do đó kết quả là x^2 + sin(x) + C.',
              difficulty: 'easy',
            },
          ],
        },
        {
          examId: 'de-ta-10-unit1-2',
          title: 'Đề Kiểm Tra Tiếng Anh 10 - Unit 1: Family Life & Household Chores',
          subject: 'Tiếng Anh',
          grade: 10,
          durationMinutes: 30,
          totalQuestions: 4,
          description: 'Kiểm tra ngữ pháp thì hiện tại đơn, hiện tại tiếp diễn và từ vựng chủ đề gia đình.',
          questions: [
            {
              id: 'ta_1',
              question: 'My mother is usually in charge of ________ the groceries for the whole family.',
              options: ['buying', 'buy', 'to buy', 'bought'],
              correctIndex: 0,
              explanation: 'Cụm từ cố định: be in charge of + V-ing (chịu trách nhiệm về việc gì). Do đó chọn "buying".',
              difficulty: 'easy',
            },
            {
              id: 'ta_2',
              question: 'Look! The students ________ basketball in the school playground.',
              options: ['are playing', 'play', 'played', 'have played'],
              correctIndex: 0,
              explanation: 'Dấu hiệu nhận biết: Từ cảm thán "Look!" chỉ hành động đang xảy ra tại thời điểm nói -> Thì hiện tại tiếp diễn (S + is/are/am + V-ing).',
              difficulty: 'easy',
            },
            {
              id: 'ta_3',
              question: 'Who is responsible for taking ________ the rubbish every evening?',
              options: ['out', 'in', 'on', 'up'],
              correctIndex: 0,
              explanation: 'Cụm động từ: "take out the rubbish" nghĩa là đổ rác.',
              difficulty: 'easy',
            },
            {
              id: 'ta_4',
              question: 'In my family, both parents ________ hands to build a happy home.',
              options: ['join', 'give', 'hold', 'shake'],
              correctIndex: 0,
              explanation: 'Idiom: "join hands" có nghĩa là chung tay, cùng nhau hợp tác làm việc gì.',
              difficulty: 'medium',
            },
          ],
        },
        {
          examId: 'de-vat-ly-9-dien-hoc',
          title: 'Đề Kiểm Tra 45 Phút Vật Lý 9 - Định Luật Ôm & Điện Trở',
          subject: 'Vật lý',
          grade: 9,
          durationMinutes: 45,
          totalQuestions: 4,
          description: 'Hệ thống câu hỏi lý thuyết và bài tập tính toán cường độ dòng điện, hiệu điện thế.',
          questions: [
            {
              id: 'vl_1',
              question: 'Hệ thức của định luật Ôm đối với đoạn mạch là gì?',
              options: ['I = U / R', 'I = U . R', 'R = U . I', 'U = I / R'],
              correctIndex: 0,
              explanation: 'Định luật Ôm: Cường độ dòng điện chạy qua dây dẫn tỉ lệ thuận với hiệu điện thế giữa hai đầu dây và tỉ lệ nghịch với điện trở: I = U / R.',
              difficulty: 'easy',
            },
            {
              id: 'vl_2',
              question: 'Đặt một hiệu điện thế U = 12V vào hai đầu điện trở R = 24Ω. Cường độ dòng điện chạy qua điện trở là:',
              options: ['0.5 A', '2 A', '288 A', '0.25 A'],
              correctIndex: 0,
              explanation: 'Áp dụng công thức: I = U / R = 12 / 24 = 0.5 A.',
              difficulty: 'easy',
            },
            {
              id: 'vl_3',
              question: 'Khi mắc nối tiếp hai điện trở R1 = 10Ω và R2 = 20Ω, điện trở tương đương của đoạn mạch là:',
              options: ['30 Ω', '15 Ω', '6.67 Ω', '200 Ω'],
              correctIndex: 0,
              explanation: 'Mắc nối tiếp: Rtđ = R1 + R2 = 10 + 20 = 30 Ω.',
              difficulty: 'easy',
            },
            {
              id: 'vl_4',
              question: 'Công suất điện của một đoạn mạch được tính bằng công thức nào sau đây?',
              options: ['P = U . I', 'P = U / I', 'P = I / U', 'P = U^2 . I'],
              correctIndex: 0,
              explanation: 'Công suất tiêu thụ điện của đoạn mạch bằng tích của hiệu điện thế và cường độ dòng điện: P = U . I.',
              difficulty: 'medium',
            },
          ],
        },
      ];

      await this.examModel.insertMany(sampleExams);
    } catch {
      // Ignored
    }
  }

  /**
   * Lấy danh sách đề thi
   */
  async getExams(grade?: number, subject?: string) {
    const filter: Record<string, unknown> = {};
    if (grade) filter.grade = Number(grade);
    if (subject && subject !== 'Tất cả') filter.subject = subject;

    return this.examModel
      .find(filter)
      .select('-questions.correctIndex -questions.explanation')
      .sort({ grade: -1, createdAt: -1 })
      .exec();
  }

  /**
   * Lấy chi tiết đề thi (che đáp án đúng nếu đang chuẩn bị làm bài)
   */
  async getExamById(examId: string, hideAnswers = true) {
    const query = this.examModel.findOne({ examId });
    if (hideAnswers) {
      query.select('-questions.correctIndex -questions.explanation');
    }
    const exam = await query.exec();
    if (!exam) {
      throw new NotFoundException(`Không tìm thấy đề thi với mã: ${examId}`);
    }
    return exam;
  }

  /**
   * Học sinh nộp bài thi -> Tự động chấm điểm, lưu lịch sử và cộng XP
   */
  async submitExamAttempt(userId: number, examId: string, dto: SubmitExamAttemptDto) {
    const exam = await this.examModel.findOne({ examId }).exec();
    if (!exam) throw new NotFoundException('Đề thi không tồn tại');

    const totalQuestions = exam.questions.length;
    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;

    const analysis = exam.questions.map((q) => {
      const studentChoice = dto.answers[q.id];
      const isAnswered = studentChoice !== undefined && studentChoice !== null;
      const isCorrect = isAnswered && studentChoice === q.correctIndex;

      if (!isAnswered) {
        unansweredCount++;
      } else if (isCorrect) {
        correctCount++;
      } else {
        wrongCount++;
      }

      return {
        questionId: q.id,
        question: q.question,
        options: q.options,
        studentChoice: isAnswered ? studentChoice : null,
        correctIndex: q.correctIndex,
        isCorrect,
        explanation: q.explanation,
      };
    });

    const scaledScore =
      totalQuestions > 0
        ? Number(((correctCount / totalQuestions) * 10).toFixed(2))
        : 0;

    // Lưu bài thi
    const attempt = new this.attemptModel({
      userId,
      examId,
      examTitle: exam.title,
      score: scaledScore,
      totalQuestions,
      correctCount,
      wrongCount,
      unansweredCount,
      durationSeconds: dto.durationSeconds,
      answers: dto.answers,
    });
    const savedAttempt = await attempt.save();

    // Thưởng điểm tia sét XP
    let bonusXP = 15;
    if (scaledScore >= 8) bonusXP = 35;
    else if (scaledScore >= 5) bonusXP = 25;

    let stats = await this.userStatsRepository.findOne({ where: { userId } });
    if (!stats) {
      stats = this.userStatsRepository.create({
        userId,
        streakDays: 1,
        lightningPoints: bonusXP,
        rankTier: 'Đồng',
      });
    } else {
      stats.lightningPoints += bonusXP;
    }
    await this.userStatsRepository.save(stats);

    return {
      message: `Hoàn thành bài thi! Bạn đạt ${scaledScore}/10 điểm (+${bonusXP} XP) ⚡`,
      attemptId: savedAttempt._id,
      score: scaledScore,
      correctCount,
      wrongCount,
      unansweredCount,
      durationSeconds: dto.durationSeconds,
      bonusXP,
      analysis,
    };
  }

  /**
   * Lấy lịch sử các lần thi của học sinh
   */
  async getAttemptsHistory(userId: number) {
    return this.attemptModel
      .find({ userId })
      .sort({ completedAt: -1 })
      .exec();
  }

  /**
   * Xem lại chi tiết kết quả một bài thi đã nộp
   */
  async getAttemptDetail(attemptId: string, userId: number) {
    const attempt = await this.attemptModel.findOne({ _id: attemptId, userId }).exec();
    if (!attempt) throw new NotFoundException('Không tìm thấy bài thi');

    const exam = await this.examModel.findOne({ examId: attempt.examId }).exec();

    const analysis = exam?.questions.map((q) => {
      const studentChoice = attempt.answers?.[q.id];
      const isAnswered = studentChoice !== undefined && studentChoice !== null;
      const isCorrect = isAnswered && studentChoice === q.correctIndex;

      return {
        questionId: q.id,
        question: q.question,
        options: q.options,
        studentChoice: isAnswered ? studentChoice : null,
        correctIndex: q.correctIndex,
        isCorrect,
        explanation: q.explanation,
      };
    }) || [];

    return {
      attempt,
      analysis,
    };
  }
}

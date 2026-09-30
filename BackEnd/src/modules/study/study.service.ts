import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';
import { Lesson, LessonDocument } from './schemas/lesson.schema';
import { UserProgress, UserProgressDocument } from './schemas/user-progress.schema';
import { SaveProgressDto } from './dto/save-progress.dto';
import { AskTutorDto } from './dto/ask-tutor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserStats } from '../users/entities/user-stats.entity';

@Injectable()
export class StudyService implements OnModuleInit {
  constructor(
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
    @InjectModel(Lesson.name)
    private readonly lessonModel: Model<LessonDocument>,
    @InjectModel(UserProgress.name)
    private readonly progressModel: Model<UserProgressDocument>,
    @InjectRepository(UserStats)
    private readonly userStatsRepository: Repository<UserStats>,
  ) {}

  async onModuleInit() {
    await this.seedInitialCoursesIfEmpty();
  }

  /**
   * Tự động khởi tạo dữ liệu mẫu nếu MongoDB chưa có khoá học nào
   */
  async seedInitialCoursesIfEmpty() {
    try {
      const count = await this.courseModel.countDocuments();
      if (count > 0) return;

      const sampleCourses = [
        {
          slug: 'toan-12-giai-tich',
          title: 'Toán 12 - Giải Tích & Khảo Sát Hàm Số',
          subject: 'Toán',
          grade: 12,
          thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80',
          description: 'Nắm vững tính đơn điệu, cực trị, giá trị lớn nhất - nhỏ nhất và khảo sát đồ thị hàm số phục vụ kỳ thi Tốt nghiệp THPT & Đánh giá năng lực.',
          totalLessons: 4,
          chapters: [
            {
              chapterId: 'c1',
              title: 'Chương 1: Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số',
              order: 1,
              lessons: [
                {
                  lessonId: 'toan-12-bai-1',
                  title: 'Bài 1: Sự đồng biến, nghịch biến của hàm số',
                  durationMinutes: 25,
                  order: 1,
                },
                {
                  lessonId: 'toan-12-bai-2',
                  title: 'Bài 2: Cực trị của hàm số',
                  durationMinutes: 30,
                  order: 2,
                },
              ],
            },
          ],
        },
        {
          slug: 'tieng-anh-10-global-success',
          title: 'Tiếng Anh 10 - Global Success',
          subject: 'Tiếng Anh',
          grade: 10,
          thumbnail: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&auto=format&fit=crop&q=80',
          description: 'Học từ vựng theo chủ đề, ngữ pháp thì hiện tại đơn vs hiện tại tiếp diễn, câu bị động và kỹ năng giao tiếp tự tin.',
          totalLessons: 3,
          chapters: [
            {
              chapterId: 'unit-1',
              title: 'Unit 1: Family Life',
              order: 1,
              lessons: [
                {
                  lessonId: 'ta-10-unit-1',
                  title: 'Lesson 1: Vocabulary & Household Chores',
                  durationMinutes: 20,
                  order: 1,
                },
              ],
            },
          ],
        },
        {
          slug: 'vat-ly-9-dien-hoc',
          title: 'Vật Lý 9 - Điện Học Căn Bản',
          subject: 'Vật lý',
          grade: 9,
          thumbnail: 'https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=600&auto=format&fit=crop&q=80',
          description: 'Khám phá định luật Ôm, điện trở dây dẫn, công suất điện và định luật Jun-Len-xơ với các thí nghiệm mô phỏng trực quan.',
          totalLessons: 2,
          chapters: [
            {
              chapterId: 'vl9-c1',
              title: 'Chương 1: Điện học',
              order: 1,
              lessons: [
                {
                  lessonId: 'vl-9-bai-1',
                  title: 'Bài 1: Sự phụ thuộc của cường độ dòng điện vào hiệu điện thế',
                  durationMinutes: 20,
                  order: 1,
                },
              ],
            },
          ],
        },
        {
          slug: 'toan-6-so-hoc',
          title: 'Toán 6 - Số Tự Nhiên & Phép Tính',
          subject: 'Toán',
          grade: 6,
          thumbnail: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=600&auto=format&fit=crop&q=80',
          description: 'Làm quen với tập hợp, luỹ thừa với số mũ tự nhiên, thứ tự thực hiện các phép tính và dấu hiệu chia hết cho 2, 3, 5, 9.',
          totalLessons: 2,
          chapters: [
            {
              chapterId: 't6-c1',
              title: 'Chương 1: Tập hợp các số tự nhiên',
              order: 1,
              lessons: [
                {
                  lessonId: 'toan-6-bai-1',
                  title: 'Bài 1: Tập hợp và các phần tử của tập hợp',
                  durationMinutes: 15,
                  order: 1,
                },
              ],
            },
          ],
        },
      ];

      await this.courseModel.insertMany(sampleCourses);

      // Seed Lessons Chi Tiết
      const sampleLessons = [
        {
          lessonId: 'toan-12-bai-1',
          courseSlug: 'toan-12-giai-tich',
          chapterId: 'c1',
          title: 'Bài 1: Sự đồng biến, nghịch biến của hàm số',
          order: 1,
          theoryContent: `
## 1. Định nghĩa tính đơn điệu của hàm số
Ký hiệu $K$ là một khoảng, một đoạn hoặc một nửa khoảng.
Giả sử hàm số $y = f(x)$ xác định trên $K$.
- Hàm số $y = f(x)$ gọi là **đồng biến (tăng)** trên $K$ nếu với mọi $x_1, x_2 \\in K$, $x_1 < x_2 \\Rightarrow f(x_1) < f(x_2)$.
- Hàm số $y = f(x)$ gọi là **nghịch biến (giảm)** trên $K$ nếu với mọi $x_1, x_2 \\in K$, $x_1 < x_2 \\Rightarrow f(x_1) > f(x_2)$.

---

## 2. Điều kiện đủ để hàm số đơn điệu (Sử dụng đạo hàm)
Giả sử hàm số $y = f(x)$ có đạo hàm trên khoảng $K$:
1. Nếu $f'(x) > 0$ với mọi $x \\in K$ thì hàm số $f(x)$ **đồng biến** trên khoảng $K$.
2. Nếu $f'(x) < 0$ với mọi $x \\in K$ thì hàm số $f(x)$ **nghịch biến** trên khoảng $K$.
3. Nếu $f'(x) = 0$ với mọi $x \\in K$ thì hàm số $f(x)$ **không đổi (hàm hằng)** trên khoảng $K$.

> **Định lý mở rộng:** Nếu $f'(x) \\ge 0$ (hoặc $f'(x) \\le 0$) với mọi $x \\in K$ và đẳng thức $f'(x) = 0$ chỉ xảy ra tại một số hữu hạn điểm thì hàm số đồng biến (hoặc nghịch biến) trên $K$.

---

## 3. Quy trình 4 bước xét tính đơn điệu
- **Bước 1:** Tìm tập xác định $D$ của hàm số.
- **Bước 2:** Tính đạo hàm $y' = f'(x)$. Tìm các nghiệm của phương trình $f'(x) = 0$ hoặc các điểm $x$ làm cho đạo hàm không xác định.
- **Bước 3:** Lập bảng xét dấu đạo hàm (bảng biến thiên).
- **Bước 4:** Kết luận các khoảng đồng biến, nghịch biến của hàm số.
          `,
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          summary: [
            'f\'(x) > 0 trên khoảng K => Hàm số đồng biến (đồ thị đi lên từ trái sang phải).',
            'f\'(x) < 0 trên khoảng K => Hàm số nghịch biến (đồ thị đi xuống từ trái sang phải).',
            'Nghiệm của f\'(x) = 0 là các điểm tới hạn cần đưa vào bảng biến thiên.',
          ],
          flashcards: [
            {
              id: 'fc_1',
              term: 'Hàm số đồng biến',
              definition: 'Khi x tăng thì giá trị f(x) cũng tăng (đạo hàm f\'(x) > 0)',
              example: 'y = 2x + 1 có y\' = 2 > 0 luôn đồng biến trên R',
              difficulty: 'easy',
            },
            {
              id: 'fc_2',
              term: 'Hàm số nghịch biến',
              definition: 'Khi x tăng thì giá trị f(x) lại giảm (đạo hàm f\'(x) < 0)',
              example: 'y = -3x + 5 có y\' = -3 < 0 luôn nghịch biến trên R',
              difficulty: 'easy',
            },
            {
              id: 'fc_3',
              term: 'Điểm tới hạn',
              definition: 'Điểm mà tại đó f\'(x) = 0 hoặc f\'(x) không xác định',
              example: 'y = x^3 - 3x có y\' = 3x^2 - 3 = 0 <=> x = 1 hoặc x = -1',
              difficulty: 'medium',
            },
            {
              id: 'fc_4',
              term: 'Quy tắc xét dấu nhị thức bậc nhất',
              definition: 'Trước trái - Sau cùng (Trái dấu hệ số a trước nghiệm, cùng dấu sau nghiệm)',
              example: 'f(x) = 2x - 4 có nghiệm x = 2; với x > 2 thì f(x) > 0',
              difficulty: 'medium',
            },
            {
              id: 'fc_5',
              term: 'Quy tắc xét dấu tam thức bậc hai',
              definition: 'Trong trái - Ngoài cùng (Trong khoảng 2 nghiệm trái dấu a, ngoài cùng dấu a)',
              example: 'x^2 - 5x + 6 có nghiệm 2 và 3; trong khoảng (2;3) mang dấu âm',
              difficulty: 'hard',
            },
          ],
          practiceQuestions: [
            {
              id: 'q1',
              question: 'Cho hàm số y = x^3 - 3x^2 + 2. Mệnh đề nào sau đây là ĐÚNG?',
              options: [
                'Hàm số đồng biến trên khoảng (0; 2)',
                'Hàm số nghịch biến trên khoảng (0; 2)',
                'Hàm số đồng biến trên khoảng (-∞; 2)',
                'Hàm số nghịch biến trên khoảng (2; +∞)',
              ],
              correctIndex: 1,
              explanation: 'Tính đạo hàm y\' = 3x^2 - 6x = 3x(x - 2). Cho y\' = 0 <=> x = 0 hoặc x = 2. Trong khoảng (0; 2), y\' < 0 nên hàm số nghịch biến trên (0; 2).',
            },
            {
              id: 'q2',
              question: 'Tìm tất cả các khoảng đồng biến của hàm số y = -x^3 + 3x.',
              options: [
                '(-1; 1)',
                '(-∞; -1) và (1; +∞)',
                '(-∞; -1)',
                '(1; +∞)',
              ],
              correctIndex: 0,
              explanation: 'y\' = -3x^2 + 3 = -3(x^2 - 1). y\' = 0 <=> x = ±1. Hệ số a = -3 < 0. Theo quy tắc trong trái ngoài cùng, y\' > 0 khi x ∈ (-1; 1). Do đó hàm số đồng biến trên (-1; 1).',
            },
            {
              id: 'q3',
              question: 'Hàm số nào sau đây ĐỒNG BIẾN trên toàn bộ tập số thực R?',
              options: [
                'y = x^4 + 2x^2 + 1',
                'y = x^3 + 2x - 5',
                'y = (x + 1) / (x - 2)',
                'y = tan(x)',
              ],
              correctIndex: 1,
              explanation: 'Xét hàm y = x^3 + 2x - 5 có y\' = 3x^2 + 2. Vì 3x^2 ≥ 0 với mọi x nên y\' = 3x^2 + 2 ≥ 2 > 0 với mọi x ∈ R. Do đó hàm số luôn đồng biến trên R.',
            },
          ],
        },
      ];

      await this.lessonModel.insertMany(sampleLessons);
    } catch {
      // Ignored if collection already exists
    }
  }

  /**
   * Lấy danh sách khoá học, hỗ trợ lọc theo khối lớp và môn học
   */
  async getCourses(grade?: number, subject?: string) {
    const filter: Record<string, unknown> = {};
    if (grade) filter.grade = Number(grade);
    if (subject && subject !== 'Tất cả') filter.subject = subject;

    return this.courseModel.find(filter).sort({ grade: -1, title: 1 }).exec();
  }

  /**
   * Lấy chi tiết khoá học theo Slug
   */
  async getCourseBySlug(slug: string, userId?: number) {
    const course = await this.courseModel.findOne({ slug }).exec();
    if (!course) {
      throw new NotFoundException(`Không tìm thấy khoá học với slug: ${slug}`);
    }

    let progressList: UserProgress[] = [];
    if (userId) {
      progressList = await this.progressModel.find({ userId, courseSlug: slug }).exec();
    }

    return {
      course,
      progressList,
    };
  }

  /**
   * Lấy chi tiết một bài học (gồm 4 phần: Lý thuyết, Flashcard, Bài tập, Lỗi sai)
   */
  async getLessonById(lessonId: string, userId?: number) {
    const lesson = await this.lessonModel.findOne({ lessonId }).exec();
    if (!lesson) {
      throw new NotFoundException(`Không tìm thấy bài học với mã: ${lessonId}`);
    }

    let userProgress: UserProgress | null = null;
    if (userId) {
      userProgress = await this.progressModel.findOne({ userId, lessonId }).exec();
    }

    return {
      lesson,
      userProgress,
    };
  }

  /**
   * Lưu tiến độ học bài của học sinh và cộng điểm Gamification
   */
  async saveProgress(userId: number, lessonId: string, dto: SaveProgressDto) {
    let progress = await this.progressModel.findOne({ userId, lessonId });

    let isFirstTimeTheory = false;
    let isFirstTimePractice = false;

    if (!progress) {
      progress = new this.progressModel({
        userId,
        lessonId,
        courseSlug: dto.courseSlug,
        completedTheory: dto.completedTheory || false,
        learnedFlashcardIds: dto.learnedFlashcardIds || [],
        practiceScore: dto.practiceScore || 0,
        wrongQuestionIds: dto.wrongQuestionIds || [],
      });
      if (dto.completedTheory) isFirstTimeTheory = true;
      if (dto.practiceScore && dto.practiceScore > 0) isFirstTimePractice = true;
    } else {
      if (!progress.completedTheory && dto.completedTheory) {
        isFirstTimeTheory = true;
      }
      if (progress.practiceScore === 0 && dto.practiceScore && dto.practiceScore > 0) {
        isFirstTimePractice = true;
      }

      if (dto.completedTheory !== undefined) progress.completedTheory = dto.completedTheory;
      if (dto.learnedFlashcardIds) progress.learnedFlashcardIds = dto.learnedFlashcardIds;
      if (dto.practiceScore !== undefined) progress.practiceScore = dto.practiceScore;
      if (dto.wrongQuestionIds) progress.wrongQuestionIds = dto.wrongQuestionIds;
    }

    await progress.save();

    // Thưởng điểm tia sét (XP) vào MySQL stats
    let bonusXP = 0;
    if (isFirstTimeTheory) bonusXP += 10;
    if (isFirstTimePractice) bonusXP += 15;

    if (bonusXP > 0) {
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
    }

    return {
      message: 'Cập nhật tiến độ học tập thành công',
      progress,
      bonusXP,
    };
  }

  /**
   * Hỏi đáp Gia sư AI Unilearn
   */
  async askTutor(dto: AskTutorDto) {
    const lesson = await this.lessonModel.findOne({ lessonId: dto.lessonId }).exec();

    // Giả lập câu trả lời sư phạm chi tiết và chuẩn phương pháp
    return {
      tutorName: 'Gia sư Unilearn AI',
      response: `Chào em! Về câu hỏi của em: "${dto.question}" trong bài "${lesson?.title || dto.lessonTitle || 'Bài học'}":\n\n` +
        `💡 **Phương pháp ghi nhớ nhanh:**\n` +
        `1. Em cần luôn nhớ rằng đạo hàm $y' = f'(x)$ chính là thước đo độ dốc của tiếp tuyến đồ thị.\n` +
        `2. Khi đạo hàm dương ($y' > 0$), đồ thị dốc lên từ trái sang phải, đồng nghĩa với việc giá trị $y$ tăng khi $x$ tăng (Đồng biến).\n` +
        `3. Khi đạo hàm âm ($y' < 0$), đồ thị dốc xuống, nghĩa là $y$ giảm khi $x$ tăng (Nghịch biến).\n\n` +
        `📝 **Mẹo làm bài trắc nghiệm:**\n` +
        `- Khi giải phương trình $y' = 0$, hãy chú ý nghiệm bội chẵn và nghiệm bội lẻ: Đạo hàm chỉ ĐỔI DẤU khi qua nghiệm bội lẻ (bậc 1, 3, 5...), còn qua nghiệm bội chẵn (bậc 2, 4...) đạo hàm KHÔNG đổi dấu!\n\n` +
        `Chúc em ôn tập thật tốt và làm đúng hết các câu hỏi củng cố nhé! Em còn thắc mắc chỗ nào nữa không?`,
    };
  }
}

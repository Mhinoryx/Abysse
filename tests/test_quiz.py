import unittest

from questions import get_questions


class TestQuiz(unittest.TestCase):
    def test_facile_count(self):
        questions = get_questions("facile", 5)
        self.assertEqual(len(questions), 5)

    def test_moyen_count(self):
        questions = get_questions("moyen", 10)
        self.assertEqual(len(questions), 10)

    def test_difficile_has_answers(self):
        questions = get_questions("difficile", 3)
        for q in questions:
            self.assertIn("question", q)
            self.assertIn("options", q)
            self.assertIn("answer", q)
            self.assertGreaterEqual(len(q["options"]), 2)


if __name__ == "__main__":
    unittest.main()

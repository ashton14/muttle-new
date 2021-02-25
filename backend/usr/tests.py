import unittest
import numpy.testing as npt
from src import is_even

class Testis_even(unittest.TestCase):
	def test_0(self):
		self.assertEqual(is_even(2), True)

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Topic = require('./models/Topic');
const Quiz = require('./models/Quiz');
const User = require('./models/User');
const MockTest = require('./models/MockTest');

dotenv.config();

const topics = [
  {
    title: 'Arrays',
    description: 'A collection of items stored at contiguous memory locations.',
    difficulty: 'Beginner',
    content: `# Introduction\nAn array is a linear data structure that stores elements of the same type in contiguous memory locations.\n\n## Key Concepts and Theory\n- **Fixed Size**: Once defined, the size cannot be changed (in traditional arrays).\n- **Indexing**: Access elements using zero-based indices.\n- **Homogeneity**: All elements are of the same data type.\n\n### Visualization and Dry Run\nLet's say we have \`arr = [10, 20, 30]\`.\n- Index 0: 10\n- Index 1: 20\n- Index 2: 30\nTo find \`arr[1]\`, we go directly to the memory address of the first element plus one unit of data size.\n\n## Core Operations\n1. **Traversal**: Accessing each element once.\n2. **Insertion**: Adding an element (O(n) in worst case).\n3. **Deletion**: Removing an element (O(n) in worst case).\n\n## Time and Space Complexity\n- **Access**: O(1)\n- **Search**: O(n)\n- **Space**: O(n)\n\n## Patterns and Interview Insights\n- **Two Pointers**: Used in sorting and searching.\n- **Sliding Window**: Common in subarray problems.\n\n## Quick Revision Notes\n- Continuous memory.\n- O(1) access.\n- Foundation for Stacks and Queues.\n\n## Related Topics\n- Strings\n- Stacks\n- Hashing`,
    codeExamples: {
      python: 'arr = [1, 2, 3]\nprint(arr[0])',
      cpp: '#include <iostream>\nint main() {\n  int arr[] = {1, 2, 3};\n  std::cout << arr[0];\n  return 0;\n}',
      java: 'public class Main {\n  public static void main(String[] args) {\n    int[] arr = {1, 2, 3};\n    System.out.println(arr[0]);\n  }\n}'
    },
    practiceQuestions: [
      { title: 'Two Sum', url: 'https://leetcode.com/problems/two-sum/' },
      { title: 'Maximum Subarray', url: 'https://leetcode.com/problems/maximum-subarray/' }
    ],
    order: 1
  },
  {
    title: 'Strings',
    description: 'A sequence of characters used to represent text.',
    difficulty: 'Beginner',
    content: `# Introduction\nStrings are one-dimensional arrays of characters terminated by a null character. They are fundamental in processing textual data.\n\n## Key Concepts and Theory\n- **Immutability**: In many languages (like Python/Java), strings are immutable.\n- **Storage**: Stored as character arrays or specialized string objects.\n\n### Visualization and Dry Run\n\`s = "DSA"\` -> \`['D', 'S', 'A', '\\0']\`\nConcentrating two strings \`"A" + "B"\` creates a new string \`"AB"\`.\n\n## Core Operations\n- **Concatenation**: Joining two strings.\n- **Substring**: Extracting a part of a string.\n- **Comparison**: Lexicographical comparison.\n\n## Time and Space Complexity\n- **Access**: O(1)\n- **Search**: O(n)\n- **Concatenation**: O(n + m)\n\n## Patterns and Interview Insights\n- **Anagrams**: Check using frequency counts.\n- **Palindromes**: Check using two pointers.\n\n## Quick Revision Notes\n- Strings are essentially char arrays.\n- Pay attention to space overhead during concatenation.\n\n## Related Topics\n- Arrays\n- Hashing`,
    codeExamples: {
      python: 's = "Hello World"\nprint(s[0])',
      cpp: '#include <string>\nstd::string s = "Hello";',
      java: 'String s = "Hello";'
    },
    practiceQuestions: [
      { title: 'Valid Anagram', url: 'https://leetcode.com/problems/valid-anagram/' },
      { title: 'Reverse String', url: 'https://leetcode.com/problems/reverse-string/' }
    ],
    order: 2
  },
  {
    title: 'Linked Lists',
    description: 'A linear data structure where elements are not stored at contiguous memory locations.',
    difficulty: 'Intermediate',
    content: `# Introduction\nA linked list consists of nodes where each node contains a data field and a reference to the next node.\n\n## Key Concepts and Theory\n- **Dynamic Size**: Can grow or shrink at runtime.\n- **Non-contiguous**: Nodes are scattered in memory.\n\n### Visualization and Dry Run\n\`[10 | ->] -> [20 | ->] -> [30 | NULL]\`\nTo find 30, we must traverse from 10 to 20 to 30.\n\n## Core Operations\n- **Insertion at Head**: O(1)\n- **Search**: O(n)\n- **Deletion**: O(1) if node is known, else O(n).\n\n## Time and Space Complexity\n- **Access**: O(n)\n- **Insertion/Deletion**: O(1) (at known position).\n\n## Patterns and Interview Insights\n- **Fast/Slow Pointers**: Cycle detection (Hare & Tortoise).\n- **Reverse List**: Common in-place operation.\n\n## Quick Revision Notes\n- No random access.\n- Efficient insertion/deletion at both ends.\n\n## Related Topics\n- Stacks\n- Queues\n- Trees`,
    codeExamples: {
      python: 'class Node:\n    def __init__(self, data):\n        self.data = data\n        self.next = None',
      cpp: 'struct Node {\n    int data;\n    Node* next;\n};',
      java: 'class Node {\n    int data;\n    Node next;\n}'
    },
    practiceQuestions: [
      { title: 'Reverse Linked List', url: 'https://leetcode.com/problems/reverse-linked-list/' },
      { title: 'Linked List Cycle', url: 'https://leetcode.com/problems/linked-list-cycle/' }
    ],
    order: 3
  },
  {
    title: 'Stack',
    description: 'A LIFO (Last In First Out) data structure.',
    difficulty: 'Intermediate',
    content: `# Introduction\nStacks are linear data structures following the LIFO principle.\n\n## Key Concepts\n- **Push**: Add to top.\n- **Pop**: Remove from top.\n- **Peek**: See top element.\n\n### Visualization\nThink of a stack of plates. You only add or remove from the top.\n\n## Time Complexity\n- Access: O(n)\n- Push/Pop: O(1)`,
    codeExamples: {
      python: 'stack = []\nstack.append(1)\nstack.pop()',
      cpp: '#include <stack>\nstd::stack<int> s;\ns.push(1);',
      java: 'Stack<Integer> s = new Stack<>();'
    },
    practiceQuestions: [{ title: 'Valid Parentheses', url: 'https://leetcode.com/problems/valid-parentheses/' }],
    order: 4
  },
  {
    title: 'Queue',
    description: 'A FIFO (First In First Out) data structure.',
    difficulty: 'Intermediate',
    content: `# Introduction\nQueues follow the FIFO principle.\n\n## Key Concepts\n- **Enqueue**: Add to rear.\n- **Dequeue**: Remove from front.\n\n### Visualization\nA line of people at a counter.\n\n## Time Complexity\n- Enqueue/Dequeue: O(1)`,
    codeExamples: {
      python: 'from collections import deque\nq = deque([1, 2, 3])',
      cpp: '#include <queue>\nstd::queue<int> q;',
      java: 'Queue<Integer> q = new LinkedList<>();'
    },
    practiceQuestions: [{ title: 'Number of Recent Calls', url: 'https://leetcode.com/problems/number-of-recent-calls/' }],
    order: 5
  },
  {
    title: 'Recursion',
    description: 'A process in which a function calls itself.',
    difficulty: 'Intermediate',
    content: `# Introduction\nRecursion solves problems by calling itself for smaller units.\n\n## Key Concepts\n- **Base Case**: Stop condition.\n- **Recursive Case**: Call with smaller input.\n\n## Interview Insights\n- Use Memoization to avoid redundant calls.\n- Beware of Stack Overflow.`,
    codeExamples: {
      python: 'def fact(n):\n    return 1 if n <= 1 else n * fact(n-1)',
      cpp: 'int fact(int n) { return n <= 1 ? 1 : n * fact(n-1); }',
      java: 'int fact(int n) { return n <= 1 ? 1 : n * fact(n); }'
    },
    practiceQuestions: [{ title: 'Fibonacci Number', url: 'https://leetcode.com/problems/fibonacci-number/' }],
    order: 6
  },
  {
    title: 'Sorting',
    description: 'Arranging data in a specific order.',
    difficulty: 'Intermediate',
    content: `# Introduction\nOrganizing elements in ascending or descending order.\n\n## Key Algorithms\n- Bubble Sort (O(n²))\n- Merge Sort (O(n log n))\n- Quick Sort (O(n log n))`,
    codeExamples: {
      python: 'arr.sort()',
      cpp: 'sort(arr, arr+n);',
      java: 'Arrays.sort(arr);'
    },
    practiceQuestions: [{ title: 'Merge Sorted Array', url: 'https://leetcode.com/problems/merge-sorted-array/' }],
    order: 7
  },
  {
    title: 'Searching',
    description: 'Finding elements in a data structure.',
    difficulty: 'Intermediate',
    content: `# Introduction\nLocating specific values within a dataset.\n\n## Key Algorithms\n- **Linear Search**: O(n)\n- **Binary Search**: O(log n) (Works on sorted data)`,
    codeExamples: {
      python: 'def binary_search(arr, x): ...',
      cpp: 'binary_search(v.begin(), v.end(), 10);',
      java: 'Arrays.binarySearch(arr, 10);'
    },
    practiceQuestions: [{ title: 'Binary Search', url: 'https://leetcode.com/problems/binary-search/' }],
    order: 8
  },
  {
    title: 'Trees',
    description: 'Hierarchical data structures.',
    difficulty: 'Advanced',
    content: `# Introduction\nNodes connected in a hierarchy.\n\n## Key Concepts\n- **BST**: Left child < Root < Right child.\n- **Traversal**: Pre-order, In-order, Post-order.`,
    codeExamples: {
      python: 'class TreeNode: ...',
      cpp: 'struct TreeNode { int val; TreeNode *left, *right; };',
      java: 'class TreeNode { int val; TreeNode left, right; }'
    },
    practiceQuestions: [{ title: 'Inorder Traversal', url: 'https://leetcode.com/problems/binary-tree-inorder-traversal/' }],
    order: 9
  },
  {
    title: 'Graphs',
    description: 'Vertices connected by edges.',
    difficulty: 'Advanced',
    content: `# Introduction\nModeling connections between objects.\n\n## Key Algorithms\n- **BFS**: Breadth-First Search.\n- **DFS**: Depth-First Search.\n- **Dijkstra**: Shortest path.`,
    codeExamples: {
      python: 'adj = {0: [1, 2], 1: [2], 2: [0]}',
      cpp: 'vector<int> adj[N];',
      java: 'List<List<Integer>> adj = new ArrayList<>();'
    },
    practiceQuestions: [{ title: 'Number of Islands', url: 'https://leetcode.com/problems/number-of-islands/' }],
    order: 10
  },
  {
    title: 'Dynamic Programming',
    description: 'Optimization over recursion.',
    difficulty: 'Advanced',
    content: `# Introduction\nStoring subproblem results to avoid redundancy.\n\n## Key Concepts\n- **Overlapping Subproblems**\n- **Optimal Substructure**`,
    codeExamples: {
      python: 'dp = [0] * (n + 1)',
      cpp: 'int dp[n+1];',
      java: 'int[] dp = new int[n+1];'
    },
    practiceQuestions: [{ title: 'Climbing Stairs', url: 'https://leetcode.com/problems/climbing-stairs/' }],
    order: 11
  },
  {
    title: 'Greedy',
    description: 'Locally optimal choices.',
    difficulty: 'Intermediate',
    content: `# Introduction\nMaking the best choice right now.\n\n## Use Case\n- Huffman Coding\n- Minimum Spanning Trees`,
    codeExamples: {
      python: '# Greedy logic here',
      cpp: '// Greedy logic here',
      java: '// Greedy logic here'
    },
    practiceQuestions: [{ title: 'Jump Game', url: 'https://leetcode.com/problems/jump-game/' }],
    order: 12
  },
  {
    title: 'Backtracking',
    description: 'Building candidates incrementally.',
    difficulty: 'Advanced',
    content: `# Introduction\nTrying all paths and backing up when stuck.\n\n## Common Problems\n- N-Queens\n- Permutations`,
    codeExamples: {
      python: 'def solve(state): ...',
      cpp: 'void solve(int k) { ... }',
      java: 'void solve() { ... }'
    },
    practiceQuestions: [{ title: 'Permutations', url: 'https://leetcode.com/problems/permutations/' }],
    order: 13
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Clear existing data
    await Topic.deleteMany();
    await Quiz.deleteMany();
    await MockTest.deleteMany();

    // Create Topics
    const createdTopics = await Topic.create(topics);
    console.log('Topics seeded!');

    // Create Quizzes with unique questions for each topic
    const quizData = {
      'Arrays': [
        { questionText: 'What is the time complexity of accessing an element in an array by index?', options: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'], correctAnswer: 0, explanation: 'Arrays provide constant time access via direct indexing.', type: 'Complexity' },
        { questionText: 'Which of the following is stored contiguously in memory?', options: ['Linked List', 'Array', 'HashSet', 'Tree'], correctAnswer: 1, explanation: 'Arrays are linear structures with contiguous memory allocation.', type: 'Concept' }
      ],
      'Strings': [
        { questionText: 'What is the time complexity of concatenating two strings of length m and n?', options: ['O(1)', 'O(n)', 'O(m+n)', 'O(m*n)'], correctAnswer: 2, explanation: 'Creating a new string requires copying both old strings.', type: 'Complexity' },
        { questionText: 'Strings are _____ in many languages like Java and Python.', options: ['Mutable', 'Immutable', 'Dynamic', 'Circular'], correctAnswer: 1, explanation: 'Immutability means a string cannot be changed once created.', type: 'Concept' }
      ],
      'Linked Lists': [
        { questionText: 'What is the time complexity of inserting a node at the head of a linked list?', options: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'], correctAnswer: 0, explanation: 'Only the head pointer needs to be updated.', type: 'Complexity' },
        { questionText: 'Which pointer does the last node of a singly linked list point to?', options: ['Head', 'Previous', 'Null', 'Tail'], correctAnswer: 2, explanation: 'The end of a singly linked list is marked by a null pointer.', type: 'Concept' }
      ],
      'Stack': [
        { questionText: 'Which principle does a Stack follow?', options: ['FIFO', 'LIFO', 'LILO', 'Random'], correctAnswer: 1, explanation: 'Stack is Last-In-First-Out.', type: 'Concept' },
        { questionText: 'Push and Pop operations in a stack take how much time?', options: ['O(n)', 'O(log n)', 'O(1)', 'O(n^2)'], correctAnswer: 2, explanation: 'Both operations occur at the top in constant time.', type: 'Complexity' }
      ],
      'Queue': [
        { questionText: 'Which principle does a Queue follow?', options: ['LIFO', 'FIFO', 'Random', 'Priority'], correctAnswer: 1, explanation: 'Queue is First-In-First-Out.', type: 'Concept' },
        { questionText: 'Adding an element to a queue is called _____.', options: ['Push', 'Pop', 'Enqueue', 'Dequeue'], correctAnswer: 2, explanation: 'Enqueue adds to the rear of the queue.', type: 'Concept' }
      ],
      'Recursion': [
        { questionText: 'What is the essential condition to stop a recursive function?', options: ['Infinite Loop', 'Base Case', 'Return Statement', 'Stack Size'], correctAnswer: 1, explanation: 'The base case prevents infinite recursion.', type: 'Concept' },
        { questionText: 'Recursion uses which data structure internally?', options: ['Queue', 'Stack', 'Linked List', 'Tree'], correctAnswer: 1, explanation: 'The function call stack tracks recursive calls.', type: 'Concept' }
      ],
      'Sorting': [
        { questionText: 'What is the worst-case time complexity of Quick Sort?', options: ['O(n log n)', 'O(n)', 'O(n^2)', 'O(1)'], correctAnswer: 2, explanation: 'Worst case (O(n²)) occurs with poor pivot choices.', type: 'Complexity' },
        { questionText: 'Which sorting algorithm uses Divide and Conquer and is always O(n log n)?', options: ['Bubble Sort', 'Selection Sort', 'Merge Sort', 'Insertion Sort'], correctAnswer: 2, explanation: 'Merge sort consistently provides O(n log n) performance.', type: 'Concept' }
      ],
      'Searching': [
        { questionText: 'What is the prerequisite for Binary Search?', options: ['Data must be unsorted', 'Data must be sorted', 'Data must be small', 'Data must be integers'], correctAnswer: 1, explanation: 'Binary search requires a sorted range.', type: 'Concept' },
        { questionText: 'What is the time complexity of Binary Search?', options: ['O(n)', 'O(n log n)', 'O(log n)', 'O(1)'], correctAnswer: 2, explanation: 'It halves the search space in each step.', type: 'Complexity' }
      ],
      'Trees': [
        { questionText: 'In a Binary Search Tree, the left child is always ______ than the root.', options: ['Greater', 'Smaller', 'Equal', 'Unknown'], correctAnswer: 1, explanation: 'Left child < Root < Right child in BST.', type: 'Concept' },
        { questionText: 'Which traversal visits nodes in non-descending order in a BST?', options: ['Pre-order', 'In-order', 'Post-order', 'Level-order'], correctAnswer: 1, explanation: 'In-order traversal of a BST yields sorted elements.', type: 'Concept' }
      ],
      'Graphs': [
        { questionText: 'Which algorithm finds the shortest path in a weighted graph?', options: ['BFS', 'DFS', 'Dijkstra', 'Bubble Sort'], correctAnswer: 2, explanation: 'Dijkstra is the standard for shortest paths.', type: 'Concept' },
        { questionText: 'BFS uses which data structure?', options: ['Stack', 'Queue', 'Array', 'Tree'], correctAnswer: 1, explanation: 'BFS explores level-by-level using a queue.', type: 'Concept' }
      ],
      'Dynamic Programming': [
        { questionText: 'Dynamic Programming is mainly used for ______ problems.', options: ['Searching', 'Optimization', 'Sorting', 'Traversal'], correctAnswer: 1, explanation: 'DP optimizes overlapping subproblems.', type: 'Concept' },
        { questionText: 'Storing subproblem results to avoid recomputation is called _____.', options: ['Recursion', 'Iteration', 'Memoization', 'Sorting'], correctAnswer: 2, explanation: 'Memoization is a key DP technique.', type: 'Concept' }
      ],
      'Greedy': [
        { questionText: 'Greedy algorithms make choices that are _______ optimal.', options: ['Globally', 'Locally', 'Never', 'Randomly'], correctAnswer: 1, explanation: 'Greedy makes the best local choice at each step.', type: 'Concept' },
        { questionText: 'Which problem can be solved greedily?', options: ['Merge Sort', 'Huffman Coding', 'N-Queens', 'Fibonacci'], correctAnswer: 1, explanation: 'Huffman coding uses a greedy approach.', type: 'Concept' }
      ],
      'Backtracking': [
        { questionText: 'Backtracking is an improvement over _____ search.', options: ['Binary', 'Brute force', 'Linear', 'Greedy'], correctAnswer: 1, explanation: 'It prunes search paths that cannot lead to a solution.', type: 'Concept' },
        { questionText: 'The N-Queens problem is solved using ____.', options: ['Greedy', 'Backtracking', 'Binary Search', 'Sorting'], correctAnswer: 1, explanation: 'Backtracking tries positions and retreats on conflicts.', type: 'Concept' }
      ]
    };

    const quizPromises = createdTopics.map(topic => {
      const questions = quizData[topic.title] || [
        { questionText: `Default question for ${topic.title}`, options: ['A', 'B', 'C', 'D'], correctAnswer: 0, explanation: 'Default explanation.', type: 'Concept' }
      ];

      return Quiz.create({
        topicId: topic._id,
        questions: questions
      });
    });

    await Promise.all(quizPromises);
    console.log('Unique Quizzes seeded for all topics!');

    // Create Mock Test
    await MockTest.create({
      title: 'DSA Fundamentals Mock Test',
      duration: 10,
      totalMarks: 8,
      questions: [
        {
          questionText: 'What is the time complexity of accessing an element in an array by index?',
          options: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'],
          correctAnswer: 0,
          explanation: 'Arrays allow direct index-based access in constant time.',
          type: 'MCQ'
        },
        {
          questionText: 'Which data structure follows the FIFO (First In First Out) principle?',
          options: ['Stack', 'Queue', 'Tree', 'Graph'],
          correctAnswer: 1,
          explanation: 'A Queue processes elements in the order they were added — FIFO.',
          type: 'MCQ'
        },
        {
          questionText: 'What is the worst-case time complexity of Binary Search?',
          options: ['O(n)', 'O(n log n)', 'O(log n)', 'O(1)'],
          correctAnswer: 2,
          explanation: 'Binary Search halves the search space each step, giving O(log n).',
          type: 'MCQ'
        },
        {
          questionText: 'Which traversal of a BST produces elements in sorted (ascending) order?',
          options: ['Pre-order', 'Post-order', 'Level-order', 'In-order'],
          correctAnswer: 3,
          explanation: 'In-order traversal (Left → Root → Right) visits BST nodes in sorted order.',
          type: 'MCQ'
        }
      ]
    });
    console.log('Mock Test seeded! (answers: A, B, C, D)');

    // Create an Admin user
    const adminExists = await User.findOne({ email: 'admin@dsapath.com' });
    if (!adminExists) {
      await User.create({
        name: 'Admin User',
        email: 'admin@dsapath.com',
        password: 'password123',
        role: 'admin'
      });
      console.log('Admin user created (admin@dsapath.com / password123)');
    }

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();

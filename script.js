let printBtn = document.querySelector('#printBtn');
let footer = document.querySelector('#footer');
        printBtn.style.display = 'none';
        let chaptersData; // To store chapters data

        // Function to fetch questions from math.json
        function fetchChapters() {
            fetch('math.json')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    chaptersData = data.chapters; // Store chapters data
                    populateChapterSelect(chaptersData); // Populate dropdown
                })
                .catch(error => {
                    console.error('Error fetching the questions:', error);
                    alert('Error fetching questions. Make sure the JSON file is accessible.');
                });
        }

        // Function to populate chapter dropdown
        function populateChapterSelect(chapters) {
            const chapterSelect = document.getElementById('chapterSelect');
            chapters.forEach(chapter => {
                const option = document.createElement('option');
                option.value = chapter.chapter_name; // Use chapter name as value
                option.textContent = chapter.chapter_name;
                chapterSelect.appendChild(option);
            });
        }

        // Call fetchChapters on page load
        window.onload = fetchChapters;

        // Function to generate questions based on selected chapter
        function generateQuestions() {
            const selectedChapterName = document.getElementById('chapterSelect').value;
            const selectedChapter = chaptersData.find(chapter => chapter.chapter_name === selectedChapterName);

            const questionPaper = document.getElementById('questionPaper');
            questionPaper.innerHTML = `<h2>${selectedChapterName}</h2>`;

            if (selectedChapter) {
                // Shuffle and select questions from the selected chapter
                let shuffledQuestions = shuffleArray(selectedChapter.questions);
                let selectedQuestions = shuffledQuestions.slice(0, 10); // Select up to 10 questions

                // Calculate total marks
                const totalMarks = selectedQuestions.reduce((sum, questionObj) => sum + questionObj.marks, 0);
                
                // Display total marks beside chapter name
                questionPaper.innerHTML = `<h2>${selectedChapterName} (Total Marks: ${totalMarks})</h2>`;

                selectedQuestions.forEach((questionObj, index) => {
                    const questionElement = document.createElement('p');
                    questionElement.innerHTML = `${index + 1}. ${questionObj.question} (${questionObj.marks} marks)`;
                    questionPaper.appendChild(questionElement);
                });

                // Render math after adding the questions to the DOM
                MathJax.typeset();
                printBtn.style.display = 'inline'; // Show print button
            } else {
                printBtn.style.display = 'none';
                questionPaper.innerHTML = '<p style="color:red">Please select a chapter to generate questions.</p>';
            }
        }

        // Function to shuffle the array (Fisher-Yates shuffle algorithm)
        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }

        // Function to update chapter selection (if needed)
        function updateChapterSelection() {
            const selectedChapterName = document.getElementById('chapterSelect').value;
            if (selectedChapterName) {
                console.log(`Selected Chapter: ${selectedChapterName}`);
            }
        }

        // Print Function
        function printThePage() {
            let chapterSelectionArea = document.querySelector('.chapterSelectionArea');
            chapterSelectionArea.style.display = 'none';
            footer.style.display = 'none';
            setTimeout(() => {
                window.print();
                setTimeout(e=>{
                  chapterSelectionArea.style.display = 'block';

                footer.style.display = 'block';
                },500)
            }, 1);
        }
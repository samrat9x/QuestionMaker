let printBtn = document.querySelector('#printBtn');
        printBtn.style.display = 'none';
        let chaptersData; // Holds the chapters from the fetched JSON file

        // Load the subject data (fetch the corresponding JSON file)
        function loadSubjectData() {
            const selectedSubject = document.getElementById('subjectSelect').value;

            if (selectedSubject) {
                fetch(`${selectedSubject}.json`)
                    .then(response => response.json())
                    .then(data => {
                        chaptersData = data.chapters;
                        populateChapters(chaptersData);
                    })
                    .catch(error => {
                        console.error('Error fetching JSON:', error);
                    });
            } else {
                document.getElementById('chapterCheckboxes').innerHTML = ''; // Clear chapter selection if no subject is chosen
            }
        }

        // Populate chapters in the dropdown
        function populateChapters(chapters) {
            const chapterCheckboxes = document.getElementById('chapterCheckboxes');
            chapterCheckboxes.innerHTML = ''; // Clear previous checkboxes

            chapters.forEach(chapter => {
                const checkboxLabel = document.createElement('label');
                checkboxLabel.classList.add('chapter-checkbox');

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = chapter.chapter_name;
                checkboxLabel.appendChild(checkbox);

                checkboxLabel.appendChild(document.createTextNode(chapter.chapter_name));
                chapterCheckboxes.appendChild(checkboxLabel);
            });
        }

        // Generate question paper based on selected chapters and total marks
        function generateQuestions() {
            const selectedChapters = Array.from(document.getElementById('chapterCheckboxes').selectedOptions).map(option => option.value);
            const totalMarksInput = parseInt(document.getElementById('totalMarksInput').value);
            const questionPaper = document.getElementById('questionPaper');
            questionPaper.innerHTML = ''; // Clear previous content

            if (selectedChapters.length === 0 || isNaN(totalMarksInput) || totalMarksInput <= 0) {
                alert('Please select at least one chapter and enter valid total marks.');
                return;
            }

            let allSelectedQuestions = [];

            // Get questions from selected chapters
            selectedChapters.forEach(chapterName => {
                const selectedChapter = chaptersData.find(chapter => chapter.chapter_name === chapterName);
                allSelectedQuestions = allSelectedQuestions.concat(selectedChapter.questions);
            });

            // Shuffle questions and select based on total marks
            let shuffledQuestions = shuffleArray(allSelectedQuestions);
            let selectedQuestions = [];
            let totalMarks = 0;

            for (let i = 0; i < shuffledQuestions.length; i++) {
                if (totalMarks + shuffledQuestions[i].marks <= totalMarksInput) {
                    selectedQuestions.push(shuffledQuestions[i]);
                    totalMarks += shuffledQuestions[i].marks;
                }
                if (totalMarks >= totalMarksInput) break;
            }

            if (totalMarks === totalMarksInput) {
                questionPaper.innerHTML = `<h2>${document.getElementById('subjectSelect').value} (Total Marks: ${totalMarksInput})</h2>`;
                selectedQuestions.forEach((questionObj, index) => {
                    questionPaper.innerHTML += `<p>${index + 1}. ${questionObj.question} (${questionObj.marks} marks)</p>`;
                });
                printBtn.style.display = 'inline'; // Show print button
            } else {
                questionPaper.innerHTML = `<p>Couldn't match the exact total marks. Please try again with different total marks or fewer chapters.</p>`;
            }

            // Re-render math equations using MathJax
            MathJax.typeset();
        }

        // Function to shuffle array (Fisher-Yates algorithm)
        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }

        // Print Function
        function printThePage() {
            let chapterSelectionArea = document.querySelector('.chapterSelectionArea');
            chapterSelectionArea.style.display = 'none';
            setTimeout(e => {
                window.print();
                chapterSelectionArea.style.display = 'block';
            }, 3000);
        }
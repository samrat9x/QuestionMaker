// selector functions
function $(e){
    return document.querySelector(e);
}
function id(e){
    return document.getElementById(e);
}
let printBtn = $('#printBtn');
printBtn.style.display = 'none';
let chaptersData; // Holds the chapters from the fetched JSON file
let selectedClass = ''; // Stores selected class
let message = $('.message');

window.addEventListener('click',e=>{
    if(e.target.className === 'message'){
        message.style.display = 'none';
    }
});
function messages(msg){
    message.style.display = 'block';
    message.innerHTML = `<div><p>${msg}</p></div>`;
}

// Update class selection
function updateClassSelection() {
    selectedClass = id('classSelect').value;
    if (!selectedClass) {
        messages('অনুগ্রহপূর্বক একটি শ্রেণী নির্বাচন করুন');
        id('subjectSelect').selectedIndex = 0;
        id('chapterCheckboxes').innerHTML = '';
        id('subjectTitle').innerHTML = '';
        return;
    }
    loadSubjectData();
}

// Load the subject data (fetch the corresponding JSON file based on class and subject)
function loadSubjectData() {
    if (!selectedClass) {
        messages('অনুগ্রহপূর্বক প্রথমে একটি শ্রেণী নির্বাচন করুন');
        id('subjectSelect').selectedIndex = 0;
        id('chapterCheckboxes').innerHTML = '';
        id('subjectTitle').innerHTML = '';
        return;
    }

    const selectedSubject = id('subjectSelect').value;
    
    // Set the subject name in the title
    const subjectTitle = id('subjectTitle');
    subjectTitle.textContent = selectedSubject ? `${selectedSubject.charAt(0).toUpperCase() + selectedSubject.slice(1)} Question Paper for ${selectedClass}` : '';

    if (selectedSubject) {
        fetch(`${selectedClass}_${selectedSubject}.json`)
            .then(response => response.json())
            .then(data => {
                chaptersData = data.chapters;
                populateChapters(chaptersData); // Populate checkboxes for chapters
            })
            .catch(error => {
                id('chapterCheckboxes').innerHTML = ''; // Clear checkboxes if no json file found
                console.error('Error fetching JSON:', error);
            });
    } else {
        id('chapterCheckboxes').innerHTML = ''; // Clear checkboxes if no subject is chosen
    }
}

// Populate chapter checkboxes
function populateChapters(chapters) {
    const chapterCheckboxes = id('chapterCheckboxes');
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
    const selectedChapters = Array.from(document.querySelectorAll('#chapterCheckboxes input:checked')).map(checkbox => checkbox.value);
    const totalMarksInput = parseInt(id('totalMarksInput').value);
    const questionPaper = id('questionPaper');
    questionPaper.innerHTML = ''; // Clear previous content

    if (selectedChapters.length === 0 || isNaN(totalMarksInput) || totalMarksInput <= 0) {
        messages('অনুগ্রহপূর্বক অন্ততপক্ষে একটি অধ্যায় নির্বাচন করুন এবং কত নম্বরের পরীক্ষা নিতে চান সেটি উল্লেখ করুন');
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
        $('.school').innerHTML = `<h1>ফেনী মডেল হাই স্কুল</h1>`;
        $('.timeandmarks').innerHTML = `<span>সময়—১ ঘন্টা ৪০ মিনিট</span><span>পূর্ণমান—${numFixer(totalMarksInput)}</span>`;
        $('.instruction').innerHTML = `<p>[ দ্রষ্টব্যঃ ডান পাশের সংখ্যা প্রশ্নের পূর্ণমান জ্ঞাপক। যেকোনো ৫ টি প্রশ্নের উত্তর দাও। ]</p>`;

        // main question
        selectedQuestions.forEach((questionObj, index) => {
            questionPaper.innerHTML += `<div class="final"><div class="interFinal"><span style="padding-right: 2px;">${numFixer(index + 1)}.</span><span>${questionObj.image?`<img src="${questionObj.image}"><br>`:''}${questionObj.question}</span></div><div><p>${numFixer(questionObj.marks)}</p></div></div>`;
        });
        

        $('#editable').innerText = `প্রশ্নটি এডিট করতে চাইলে প্রশ্নের উপর ক্লিক করুন। এডিট করা শেষে প্রিন্ট করতে প্রিন্ট বাটনে ক্লিক করুন। `;
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
    let chapterSelectionArea = $('.chapterSelectionArea');
    let footer = $('footer');
    footer.style.display = 'none';
    chapterSelectionArea.style.display = 'none';
    setTimeout(e => {
        window.print();
        setTimeout(e=>{
          chapterSelectionArea.style.display = 'block';
          footer.style.display = 'block';
        },1000)
        
    }, 50);
}


// index or marks convert to bangla
const banglaNumbers = [
    "০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯", "১০", "১১", "১২", "১৩", "১৪", "১৫", "১৬", "১৭", "১৮", "১৯", "২০", 
    "২১", "২২", "২৩", "২৪", "২৫", "২৬", "২৭", "২৮", "২৯", "৩০", "৩১", "৩২", "৩৩", "৩৪", "৩৫", "৩৬", "৩৭", "৩৮", "৩৯", "৪০", 
    "৪১", "৪২", "৪৩", "৪৪", "৪৫", "৪৬", "৪৭", "৪৮", "৪৯", "৫০", "৫১", "৫২", "৫৩", "৫৪", "৫৫", "৫৬", "৫৭", "৫৮", "৫৯", "৬০", 
    "৬১", "৬২", "৬৩", "৬৪", "৬৫", "৬৬", "৬৭", "৬৮", "৬৯", "৭০", "৭১", "৭২", "৭৩", "৭৪", "৭৫", "৭৬", "৭৭", "৭৮", "৭৯", "৮০", 
    "৮১", "৮২", "৮৩", "৮৪", "৮৫", "৮৬", "৮৭", "৮৮", "৮৯", "৯০", "৯১", "৯২", "৯৩", "৯৪", "৯৫", "৯৬", "৯৭", "৯৮", "৯৯", "১০০"
  ];
  
function numFixer(e){
    return banglaNumbers[e];
}

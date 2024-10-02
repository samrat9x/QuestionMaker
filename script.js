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


function messages(msg){
    $('#message').innerHTML = `<div>${msg}</div>`;
    id('popup').classList.add('active');
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

    // Set the subject name in the title
    const selectedSubject = id('subjectSelect').value;
    let subject = id('subjectSelect').options[id('subjectSelect').selectedIndex].text; 
    const subjectTitle = id('subjectTitle');
    subjectTitle.innerHTML = selectedSubject ? `${subject}<br>${banglaSerial[selectedClass]} শ্রেণী` : '';

    if (selectedSubject) {
        let url = `data/${selectedClass}/${selectedClass}_${selectedSubject}.json`;
        fetch(url)
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
    const cqChecked = id('cq').checked;
    const mcqChecked = id('mcq').checked;
    const bothChecked = id('both').checked;

    const selectedChapters = Array.from(document.querySelectorAll('#chapterCheckboxes input:checked')).map(checkbox => checkbox.value);
    const totalMarksInput = parseInt(id('totalMarksInput').value);
    const questionPaper = id('questionPaper');
    questionPaper.innerHTML = ''; // Clear previous content

    if (selectedChapters.length === 0 || isNaN(totalMarksInput) || totalMarksInput <= 0) {
        messages('অনুগ্রহপূর্বক অন্ততপক্ষে একটি অধ্যায় নির্বাচন করুন এবং কত নম্বরের পরীক্ষা নিতে চান সেটি উল্লেখ করুন');
        return;
    }

    let allSelectedQuestions = [];
    let allMcq = [];

    // Get questions from selected chapters
    selectedChapters.forEach(chapterName => {
        const selectedChapter = chaptersData.find(chapter => chapter.chapter_name === chapterName);
        allSelectedQuestions = allSelectedQuestions.concat(selectedChapter.questions);
        if(selectedChapter.mcq){
            allMcq = allMcq.concat(selectedChapter.mcq);
        }
    });

    // console.log(allMcq); // checkpoint 1

    // Shuffle questions and select based on total marks
    let shuffledQuestions = shuffleArray(allSelectedQuestions);//----------cq
    let selectedQuestions = [];
    let shuffledMcq = shuffleArray(allMcq);//------------mcq
    let selectedMcq = [];
    let totalMarks = 0;

    // console.log(shuffledMcq)

    if(cqChecked){
        totalMarks = 0;
        for (let i = 0; i < shuffledQuestions.length; i++) {
            if (totalMarks + shuffledQuestions[i].marks <= totalMarksInput) {
                selectedQuestions.push(shuffledQuestions[i]);
                totalMarks += shuffledQuestions[i].marks;
            }
            if (totalMarks >= totalMarksInput) break;
        }
    }
    if(mcqChecked){
        totalMarks = 0;
        for (let i = 0; i < shuffledMcq.length; i++) {
            if (totalMarks + shuffledMcq[i].marks <= totalMarksInput) {
                selectedMcq.push(shuffledMcq[i].question);
                totalMarks += shuffledMcq[i].marks;
            }
            if (totalMarks >= totalMarksInput) break;
        }
    }
    if(bothChecked){
        totalMarks = 0;
        for (let i = 0; i < shuffledMcq.length; i++) {
            if (totalMarks + shuffledMcq[i].marks <= 15) {
                selectedMcq.push(shuffledMcq[i].question);
                totalMarks += shuffledMcq[i].marks;
            }
            if (totalMarks >= 15){
                totalMarks = 0;
                break;
            }
        }
        for (let i = 0; i < shuffledQuestions.length; i++) {
                selectedQuestions.push(shuffledQuestions[i]);
                totalMarks += shuffledQuestions[i].marks;
                if(shuffledQuestions.length === selectedQuestions.length){
                    totalMarks = 100;
                }
        }        
    }

    // console.log(selectedMcq); // checkpoint 2
    // console.log(selectedQuestions); // checkpoint 2

    if (totalMarks === totalMarksInput) {
        $('.school').innerHTML = `<h1>ফেনী মডেল হাই স্কুল</h1>`;
        $('.timeandmarks').innerHTML = `<span>সময়—১ ঘন্টা ৪০ মিনিট</span><span>পূর্ণমান—${banglaNumbers[totalMarksInput]}</span>`;

        // main question
        if(mcqChecked){
            questionPaper.style.flexDirection = 'column';
            id('answers').innerHTML = ''; 

            const part1 = document.createElement("div");
            part1.className = 'part1';
            const part2 = document.createElement("div");
            part2.className = 'part2';
            const part3 = document.createElement("div");
            part3.className = 'part3';
            const part4 = document.createElement("div");
            part4.className = 'part4';
            const part12holder = document.createElement("div");
            part12holder.className = 'part12holder';
            const part34holder = document.createElement("div");
            part34holder.className = 'part34holder';

            selectedMcq.forEach((question, index) => {
                
                    const questionBlock = document.createElement("div");
                    questionBlock.className = "question-block";
                    questionBlock.innerHTML = `
                        <p><b>${banglaNumbers[index + 1]}.</b> ${question}</p>
                        <div class="options">
                            <div class="child">
                                <span>ক) ${shuffledMcq[index].options.A}</span>
                                <span>গ) ${shuffledMcq[index].options.C}</span>
                            </div>
                            <div class="child">
                                <span>খ) ${shuffledMcq[index].options.B}</span> 
                                <span>ঘ) ${shuffledMcq[index].options.D}</span>
                            </div>
                        </div>
                    `;
                if(index<12){
                    part1.appendChild(questionBlock);
                    part12holder.appendChild(part1);
                    questionPaper.appendChild(part12holder);
                }else if(index>=12&&index<24){
                    part2.appendChild(questionBlock);
                    part12holder.appendChild(part2);
                    questionPaper.appendChild(part12holder);
                }else if(index>=24&&index<36){
                    part3.appendChild(questionBlock);
                    part34holder.appendChild(part3);
                    questionPaper.appendChild(part34holder);
                }else if(index>=36&&index<50){
                    part4.appendChild(questionBlock);
                    part34holder.appendChild(part4);
                    questionPaper.appendChild(part34holder);
                }

    
                // Fill answer sheet
                const answerLi = document.createElement("li");
                answerLi.className = 'answerList';
                answerLi.textContent = `${banglaNumbers[index + 1]} -- ${englishTobangla[shuffledMcq[index].correct_answer]},`;
                id('answers').appendChild(answerLi);
            });
            id('answerSheet').style.display = 'block';
            $('.instruction').innerHTML = '';
            // questionPaper.style.flexDirection = 'row';
        }

        if(cqChecked){
            questionPaper.style.flexDirection = 'column';
            id('answerSheet').style.display = 'none';
            selectedQuestions.forEach((questionObj, index) => {
                questionPaper.innerHTML += `<div class="final"><div class="interFinal"><span style="padding-right: 2px;">${banglaNumbers[index + 1]}.</span><span>${questionObj.image?`<img src="${questionObj.image}"><br>`:''}${questionObj.question}</span></div><div><p>${banglaNumbers[questionObj.marks]}</p></div></div>`;
            });

            $('.instruction').innerHTML = `<p>[<i> দ্রষ্টব্যঃ ডান পাশের সংখ্যা প্রশ্নের পূর্ণমান জ্ঞাপক। যেকোনো ৫ টি প্রশ্নের উত্তর দাও।</i> ]</p>`;
        }

        if(bothChecked){
            $('.timeandmarks').innerHTML = `<span>সময়—৩ ঘন্টা</span><span>পূর্ণমান—${banglaNumbers[totalMarksInput]}</span>`;

            id('answers').innerHTML = ''; 

            const bothMcq = document.createElement("div");
            bothMcq.className = 'bothMcq';
            const bothMcq2 = document.createElement("div");
            const bigBothHolder = document.createElement("div");
            bigBothHolder.className = 'bigBothHolder';

            bothMcq.innerHTML = `<div><h3>ক বিভাগ : নৈর্ব্যক্তিক প্রশ্ন—২৫টি (প্রতিটি প্রশ্নের মান ১)</h3></div><div style="display:flex;justify-content:space-between"><div><span style="font-weight:bolder; font-size:11pt;">বহুনির্বাচনী প্রশ্ন : </span>(সঠিক উত্তরটি খাতায় লিখ)</div><div style="margin-right: 10px">১ × ১৫ = ১৫</div></div>`;

            selectedMcq.forEach((question, index) => {
                
                    const questionBlock = document.createElement("div");
                    questionBlock.className = "question-block";
                    questionBlock.innerHTML = `
                        <p><b>${banglaNumbers[index + 1]}.</b> ${question}</p>
                        <div class="options">
                            <div class="child">
                                <span>ক) ${shuffledMcq[index].options.A}</span>
                                <span>গ) ${shuffledMcq[index].options.C}</span>
                            </div>
                            <div class="child">
                                <span>খ) ${shuffledMcq[index].options.B}</span> 
                                <span>ঘ) ${shuffledMcq[index].options.D}</span>
                            </div>
                        </div>
                    `;
                if(index<12){
                    bothMcq.append(questionBlock);
                }else if(index>=12 && index<15){
                    bothMcq2.appendChild(questionBlock);
                }

                // Fill answer sheet
                const answerLi = document.createElement("li");
                answerLi.className = 'answerList';
                answerLi.textContent = `${banglaNumbers[index + 1]} -- ${englishTobangla[shuffledMcq[index].correct_answer]},`;
                id('answers').appendChild(answerLi);
            });
            const bothHolder = document.createElement('div');
            bigBothHolder.append(bothMcq,bothHolder);
            id('answerSheet').style.display = 'block';
            
            // entry cq
            selectedQuestions = shuffleArray(selectedQuestions);
            const bothMcqShort = document.createElement("div");
            bothMcqShort.className = 'bothMcqShort';
            const bothShort = document.createElement("div");
            bothShort.className = 'bothShort';
            const bothBrief = document.createElement("div");
            bothBrief.className = 'bothBrief';
            const bothBroad = document.createElement("div");
            bothBroad.className = 'bothBroad';
            let count1 = 1;
            let count2 = 1;
            let count3 = 1;
            let count4 = 1;
            for(let questionObj of selectedQuestions){
                if(questionObj.marks === 1){
                    if(count1 === 11) continue;
                    bothMcqShort.innerHTML += `<div class="final"><div class="interFinal"><span style="padding-right: 2px;">${banglaNumbers[count1++]}.</span><span>${questionObj.image?`<img src="${questionObj.image}"><br>`:''}${questionObj.question}</span></div><div></div></div>`;
                }
                if(questionObj.marks === 2){
                    if(count2 === 11) continue;
                    bothShort.innerHTML += `<div class="final"><div class="interFinal"><span style="padding-right: 2px;">${banglaNumbers[count2++]}.</span><span>${questionObj.image?`<img src="${questionObj.image}"><br>`:''}${questionObj.question}</span></div><div></div></div>`;
                }
                if(questionObj.marks === 3){
                    if(count3 === 6) continue;
                    bothBrief.innerHTML += `<div class="final"><div class="interFinal"><span style="padding-right: 2px;">${banglaNumbers[count3++]}.</span><span>${questionObj.image?`<img src="${questionObj.image}"><br>`:''}${questionObj.question}</span></div><div></div></div>`;
                }
                if(questionObj.marks === 8){
                    if(count4 === 9) continue;
                    bothBroad.innerHTML += `<div class="final" style="margin-top: 10px;"><div class="interFinal"><span style="padding-right: 2px;">${banglaNumbers[count4++]}.</span><span>${questionObj.image?`<img src="${questionObj.image}"><br>`:''}${questionObj.question}</span></div><div></div></div>`;
                }
                
            }
            const markDistri2 = document.createElement('div');
            markDistri2.className = 'markDistri2';
            markDistri2.innerHTML = `<div style="display:flex;justify-content:space-between;"><span style="font-weight:bolder; font-size:11pt;">এককথায় উত্তর দাও :</span><span>১ × ১০ = ১০</span></div>`;
            bothMcqShort.prepend(markDistri2);
            
            const markDistri3 = document.createElement('div');
            markDistri3.className = 'markDistri3';
            markDistri3.innerHTML = `<h3 style="text-align:center;">খ বিভাগ : সংক্ষিপ্ত উত্তর প্রশ্ন</h3><div style="display:flex;justify-content:space-between;"><span style="font-weight:bolder; font-size:11pt;">নিচের প্রশ্নগুলোর উত্তর দাও :</span><span>২ × ১০ = ২০</span></div>`;
            bothShort.prepend(markDistri3);
            
            const markDistri4 = document.createElement('div');
            markDistri4.className = 'markDistri4';
            markDistri4.innerHTML =  `<h3 style="text-align:center;">গ বিভাগ : রচনামূলক প্রশ্ন (প্রেক্ষাপটবিহীন)</h3><div style="display:flex;justify-content:space-between;"><span style="font-weight:bolder; font-size:11pt;">যেকোনো তিনটি প্রশ্নের উত্তর দাও :</span><span>৫ × ৩ = ১৫</span></div>`;
            bothBrief.prepend(markDistri4);
            
            const markDistri5 = document.createElement('div');
            markDistri5.className = 'markDistri5';
            markDistri5.innerHTML =  `<h3 style="text-align:center;">ঘ বিভাগ : রচনামূলক প্রশ্ন (প্রেক্ষাপটনির্ভর)</h3><div style="display:flex;justify-content:space-between;"><span style="font-weight:bolder; font-size:11pt;">যেকোনো তিনটি প্রশ্নের উত্তর দাও :</span><span>৮ × ৫ = ৪০</span></div>`;
            bothBroad.prepend(markDistri5);

            bothHolder.className = 'bothHolder';
            bothHolder.append(bothMcq2,bothMcqShort,bothShort,bothBrief);

            questionPaper.append(bigBothHolder,bothBroad);     


        }
        

        $('#editable').innerText = `প্রশ্নটি এডিট করতে চাইলে প্রশ্নের উপর ক্লিক করুন। এডিট করা শেষে প্রিন্ট করতে প্রিন্ট বাটনে ক্লিক করুন। `;
        printBtn.style.display = 'inline'; // Show print button
    } else {
        questionPaper.innerHTML = `<p style="color: red; font-size: 12px; text-align: center;">Couldn't match the exact total marks or some chapters don't have questions. Please try again with different total marks or fewer chapters.</p>`;
        id('answerSheet').style.display = 'none';
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
    id('answerSheet').style.display = 'none';
    $('.github').style.display = 'none';
    id('questionSection').classList.add('changeQuesUI');
    setTimeout(e => {
        window.print();
        setTimeout(e=>{
          id('questionSection').classList.remove('changeQuesUI');
          chapterSelectionArea.style.display = 'block';
          footer.style.display = 'block';
          $('.github').style.display = 'block';
          if(id('cq').checked){
            // id('answers').innerHTML = '';
            id('answerSheet').style.display = 'none';
          }
          if(id('mcq').checked){
            id('answerSheet').style.display = 'block';
          }
        },1000)
        
    }, 50);
}

// download answers
id("downloadBtn").addEventListener("click", function() {
    // Get the content of the div and replace <li> with newline characters
    var content = id("answers").innerHTML;
        
    // Replace <li> tags with line breaks (newlines)
    content = content.replace(/<li\s*\/?>/gi, ' ');  // Optional bullet before each list item
    content = content.replace(/<\/li\s*\/?>/gi, '\n'); // Add a line break after each list item

    // Strip other HTML tags (optional)
    content = content.replace(/<\/?[^>]+(>|$)/g, "");

    // Create a Blob with the content
    var blob = new Blob([content], { type: 'text/plain' });

    // Create a temporary link element
    var link = document.createElement("a");

    // Set the href of the link to a URL representing the Blob object
    link.href = URL.createObjectURL(blob);

    // Set the download attribute to specify the file name
    link.download = "mcq_answers.txt";

    // Append the link to the content div
    id('answers').appendChild(link);

    // Programmatically click the link to trigger the download
    link.click();

    // Optionally remove the link after the download
    id('answers').removeChild(link);
});


// reload the page if user leaves for 1 minute
let timer; // Variable to store the timer

// Attach the event listener to the visibilitychange event
document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
        // If the tab is hidden, set a timer for 1 minute (60000 milliseconds)
        timer = setTimeout(e=>location.reload(), 60000);
    } else {
        // If the tab is visible again, clear the timer
        clearTimeout(timer);
    }
});


// index or marks convert to bangla
const banglaNumbers = [
    "০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯", "১০", "১১", "১২", "১৩", "১৪", "১৫", "১৬", "১৭", "১৮", "১৯", "২০", 
    "২১", "২২", "২৩", "২৪", "২৫", "২৬", "২৭", "২৮", "২৯", "৩০", "৩১", "৩২", "৩৩", "৩৪", "৩৫", "৩৬", "৩৭", "৩৮", "৩৯", "৪০", 
    "৪১", "৪২", "৪৩", "৪৪", "৪৫", "৪৬", "৪৭", "৪৮", "৪৯", "৫০", "৫১", "৫২", "৫৩", "৫৪", "৫৫", "৫৬", "৫৭", "৫৮", "৫৯", "৬০", 
    "৬১", "৬২", "৬৩", "৬৪", "৬৫", "৬৬", "৬৭", "৬৮", "৬৯", "৭০", "৭১", "৭২", "৭৩", "৭৪", "৭৫", "৭৬", "৭৭", "৭৮", "৭৯", "৮০", 
    "৮১", "৮২", "৮৩", "৮৪", "৮৫", "৮৬", "৮৭", "৮৮", "৮৯", "৯০", "৯১", "৯২", "৯৩", "৯৪", "৯৫", "৯৬", "৯৭", "৯৮", "৯৯", "১০০"
  ];
const banglaSerial = {
    class6:'৬ষ্ঠ',
    class7:'৭ম',
    class8:'৮ম',
    class9:'৯ম',
    class10:'১০ম',  
};
const englishTobangla = {
    A: 'ক', B: 'খ', C: 'গ', D: 'ঘ'
};

// window onload
window.onload = e =>{
    document.querySelectorAll('footer > a')[1].style.opacity = '0.7'; // visitor show
    id('loading').style.display = "none";
}

$('.github').addEventListener('click',e=> window.open('https://github.com/samrat9x/QuestionMaker', '_blank'));


// Function to close the popup
id('close-popup').addEventListener('click', () => {
    popup.classList.remove('active'); // Remove the 'active' class to hide the popup
});


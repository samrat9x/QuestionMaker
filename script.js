// selector functions
function $(e) {
  return document.querySelector(e);
}
function id(e) {
  return document.getElementById(e);
}
let printBtn = $("#printBtn"); // Print button
printBtn.style.display = "none"; // Hide print button initially
let chaptersData; // Holds the chapters from the fetched JSON file
let selectedClass = ""; // Stores selected class

// Bangla serial for class selection
function messages(msg) {
  $("#message").innerHTML = `<div>${msg}</div>`; // Display messages
  id("popup").classList.add("active"); // Show popup
}

// Update class selection
function updateClassSelection() {
  selectedClass = id("classSelect").value; // Get selected class
  if (!selectedClass) {
    messages("অনুগ্রহপূর্বক একটি শ্রেণী নির্বাচন করুন"); // Display message if no class is selected
    id("subjectSelect").selectedIndex = 0; // Reset subject selection
    id("chapterCheckboxes").innerHTML = ""; // Clear chapter checkboxes
    id("subjectTitle").innerHTML = ""; // Clear subject title
    return; // Exit if no class is selected
  }
  loadSubjectData(); // Load subject data based on selected class
}

// Load the subject data (fetch the corresponding JSON file based on class and subject)
function loadSubjectData() {
  if (!selectedClass) {
    messages("অনুগ্রহপূর্বক প্রথমে একটি শ্রেণী নির্বাচন করুন"); // Display message if no class is selected
    id("subjectSelect").selectedIndex = 0; // Reset subject selection
    id("chapterCheckboxes").innerHTML = ""; // Clear chapter checkboxes
    id("subjectTitle").innerHTML = ""; // Clear subject title
    return; // Exit if no class is selected
  }

  // Set the subject name in the title
  const selectedSubject = id("subjectSelect").value; // Get selected subject
  let subject =
    id("subjectSelect").options[id("subjectSelect").selectedIndex].text; // Get subject text
  const subjectTitle = id("subjectTitle"); // Get subject title element
  subjectTitle.innerHTML = selectedSubject
    ? `${subject}<br>${banglaSerial[selectedClass]} শ্রেণী`
    : ""; // Set subject title based on selected subject

  if (selectedSubject) {
    let url = `data/${selectedClass}/${selectedClass}_${selectedSubject}.json`; // Construct the URL for the JSON file
    fetch(url)
      .then((response) => response.json()) // Parse the JSON response
      .then((data) => {
        chaptersData = data.chapters; // Store chapters data
        populateChapters(chaptersData); // Populate checkboxes for chapters
      })
      .catch((error) => {
        id("chapterCheckboxes").innerHTML = ""; // Clear checkboxes if no json file found
        console.error("Error fetching JSON:", error); // Log error if JSON fetch fails
      });
  } else {
    id("chapterCheckboxes").innerHTML = ""; // Clear checkboxes if no subject is chosen
  }
}

// Populate chapter checkboxes
function populateChapters(chapters) {
  const chapterCheckboxes = id("chapterCheckboxes"); // Get chapter checkboxes container
  chapterCheckboxes.innerHTML = ""; // Clear previous checkboxes

  chapters.forEach((chapter) => {
    const checkboxLabel = document.createElement("label");
    checkboxLabel.classList.add("chapter-checkbox"); // Add class for styling

    const checkbox = document.createElement("input"); // Create checkbox input
    checkbox.type = "checkbox"; // Set checkbox type
    checkbox.value = chapter.chapter_name; // Set checkbox value to chapter name
    checkboxLabel.appendChild(checkbox); // Append checkbox to label

    checkboxLabel.appendChild(document.createTextNode(chapter.chapter_name)); // Append chapter name to label
    chapterCheckboxes.appendChild(checkboxLabel); // Append label to chapter checkboxes container
  });
}

// Generate question paper based on selected chapters and total marks
function generateQuestions() {
  const cqChecked = id("cq").checked; // Check if CQ is selected
  const mcqChecked = id("mcq").checked; // Check if MCQ is selected
  const bothChecked = id("both").checked; // Check if both CQ and MCQ are selected

  const selectedChapters = Array.from(
    document.querySelectorAll("#chapterCheckboxes input:checked")
  ).map((checkbox) => checkbox.value); // Get selected chapters from checkboxes
  const totalMarksInput = parseInt(id("totalMarksInput").value); // Get total marks input and convert to integer
  const questionPaper = id("questionPaper"); // Get question paper container
  questionPaper.innerHTML = ""; // Clear previous content

  // Check if at least one chapter is selected and total marks input is valid
  if (
    selectedChapters.length === 0 ||
    isNaN(totalMarksInput) ||
    totalMarksInput <= 0
  ) {
    messages(
      "অনুগ্রহপূর্বক অন্ততপক্ষে একটি অধ্যায় নির্বাচন করুন এবং কত নম্বরের পরীক্ষা নিতে চান সেটি উল্লেখ করুন"
    ); // Display message if no chapters are selected or total marks input is invalid
    return; // Exit if no chapters are selected or total marks input is invalid
  }

  let allSelectedQuestions = []; // Holds all selected questions from chapters
  let allMcq = []; // Array to hold all selected questions and MCQs

  // Get questions from selected chapters
  selectedChapters.forEach((chapterName) => {
    const selectedChapter = chaptersData.find(
      (chapter) => chapter.chapter_name === chapterName
    ); // Find the selected chapter in chaptersData
    allSelectedQuestions = allSelectedQuestions.concat(
      selectedChapter.questions
    ); // Concatenate questions from the selected chapter
    if (selectedChapter.mcq) {
      allMcq = allMcq.concat(selectedChapter.mcq); // Concatenate MCQs from the selected chapter
    }
  }); // End of forEach loop

  // console.log(allMcq); // checkpoint 1

  // Shuffle questions and select based on total marks
  let shuffledQuestions = shuffleArray(allSelectedQuestions); //----------cq
  let selectedQuestions = []; // Array to hold selected questions
  let shuffledMcq = shuffleArray(allMcq); //------------mcq
  let selectedMcq = []; // Array to hold selected MCQs
  let totalMarks = 0; // Variable to hold total marks

  // console.log(shuffledMcq)

  if (cqChecked) {
    // Check if CQ is selected
    totalMarks = 0; // Reset total marks for CQ
    for (let i = 0; i < shuffledQuestions.length; i++) {
      // Loop through shuffled questions
      if (totalMarks + shuffledQuestions[i].marks <= totalMarksInput) {
        // Check if adding the question's marks exceeds total marks input
        selectedQuestions.push(shuffledQuestions[i]); // Add question to selected questions
        totalMarks += shuffledQuestions[i].marks; // Increment total marks
      }
      if (totalMarks >= totalMarksInput) break; // Break if total marks reach or exceed input
    }
  }

  // console.log(selectedQuestions); // checkpoint 1
  if (mcqChecked) {
    // Check if MCQ is selected
    totalMarks = 0; // Reset total marks for MCQ
    for (let i = 0; i < shuffledMcq.length; i++) {
      // Loop through shuffled MCQs
      if (totalMarks + shuffledMcq[i].marks <= totalMarksInput) {
        // Check if adding the MCQ's marks exceeds total marks input
        selectedMcq.push(shuffledMcq[i].question); // Add MCQ question to selected MCQs
        totalMarks += shuffledMcq[i].marks; // Increment total marks
      }
      if (totalMarks >= totalMarksInput) break; // Break if total marks reach or exceed input
    }
  }
  // console.log(selectedMcq); // checkpoint 1

  let mcqMarks = Math.floor(totalMarksInput * 0.3); // Calculate MCQ marks (30% of total) ==> 30% of 100 = 30
  let cqMarks = totalMarksInput - mcqMarks; // Calculate CQ marks (remaining 70% of total) ==> 100 - 30 = 70
  let srijonshilMarks = Math.floor(cqMarks * 0.7143); // Calculate Srijonshil marks (71.43% of CQ marks) ==> 70 * 0.7143 = 50
  // let sonkhiptoProsno = Math.floor(cqMarks * 0.2857); // Calculate Sonkhipto Prosno marks (28.57% of CQ marks) ==> 70 * 0.2857 = 20
  let srijonshilCount = Math.floor(srijonshilMarks / 10) + 3; // Calculate amount of Srijonshil based on cqMarks
  if (bothChecked) {
    // Check if both CQ and MCQ are selected

    totalMarks = 0; // Reset total marks for both CQ and MCQ

    for (let i = 0; i < shuffledMcq.length; i++) {
      // Loop through shuffled MCQs
      if (totalMarks + shuffledMcq[i].marks <= mcqMarks) {
        // Check if adding the MCQ's marks exceeds 15
        selectedMcq.push(shuffledMcq[i].question); // Add MCQ question to selected MCQs
        totalMarks += shuffledMcq[i].marks; // Increment total marks
      }
      if (totalMarks >= mcqMarks) {
        // Break if total marks reach or exceed 15
        totalMarks = 0; // Reset total marks for CQ
        break; // Exit the loop for MCQs
      }
    }
    for (let i = 0; i < shuffledQuestions.length; i++) {
      // Loop through shuffled questions
      selectedQuestions.push(shuffledQuestions[i]); // Add question to selected questions
      totalMarks += shuffledQuestions[i].marks; // Increment total marks
      if (shuffledQuestions.length === selectedQuestions.length) {
        // Check if all questions are selected
        totalMarks = totalMarksInput; // Set total marks to totalMarksInput for both CQ and MCQ
      }
    }
  }

  // console.log(selectedMcq); // checkpoint 2
  // console.log(selectedQuestions); // checkpoint 2

  if (totalMarks === totalMarksInput) {
    $(".school").innerHTML = `<h1>ফেনী মডেল হাই স্কুল</h1>`;
    $(
      ".timeandmarks"
    ).innerHTML = `<span>সময়—১ ঘন্টা ৪০ মিনিট</span><span>পূর্ণমান—${banglaNumbers[totalMarksInput]}</span>`;

    // main question
    if (mcqChecked) {
      questionPaper.style.flexDirection = "column";
      id("answers").innerHTML = "";

      const part1 = document.createElement("div");
      part1.className = "part1";
      const part2 = document.createElement("div");
      part2.className = "part2";
      const part3 = document.createElement("div");
      part3.className = "part3";
      const part4 = document.createElement("div");
      part4.className = "part4";
      const part12holder = document.createElement("div");
      part12holder.className = "part12holder";
      const part34holder = document.createElement("div");
      part34holder.className = "part34holder";

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
        if (index < 12) {
          part1.appendChild(questionBlock);
          part12holder.appendChild(part1);
          questionPaper.appendChild(part12holder);
        } else if (index >= 12 && index < 24) {
          part2.appendChild(questionBlock);
          part12holder.appendChild(part2);
          questionPaper.appendChild(part12holder);
        } else if (index >= 24 && index < 36) {
          part3.appendChild(questionBlock);
          part34holder.appendChild(part3);
          questionPaper.appendChild(part34holder);
        } else if (index >= 36 && index < 50) {
          part4.appendChild(questionBlock);
          part34holder.appendChild(part4);
          questionPaper.appendChild(part34holder);
        }

        // Fill answer sheet
        const answerLi = document.createElement("li");
        answerLi.className = "answerList";
        answerLi.textContent = `${banglaNumbers[index + 1]} -- ${
          englishTobangla[shuffledMcq[index].correct_answer]
        },`;
        id("answers").appendChild(answerLi);
      });
      id("answerSheet").style.display = "block";
      $(".instruction").innerHTML = "";
      // questionPaper.style.flexDirection = 'row';
    }

    if (cqChecked) {
      questionPaper.style.flexDirection = "column";
      id("answerSheet").style.display = "none";
      selectedQuestions.forEach((questionObj, index) => {
        questionPaper.innerHTML += `<div class="final"><div class="interFinal"><span style="padding-right: 2px;">${
          banglaNumbers[index + 1]
        }.</span><span>${
          questionObj.image
            ? `<img id="importedImg" src="${questionObj.image}"><br>`
            : ""
        }${questionObj.question}</span></div><div><p>${
          banglaNumbers[questionObj.marks]
        }</p></div></div>`;
      });

      $(
        ".instruction"
      ).innerHTML = `<p>[<i> দ্রষ্টব্যঃ ডান পাশের সংখ্যা প্রশ্নের পূর্ণমান জ্ঞাপক। যেকোনো ৫ টি প্রশ্নের উত্তর দাও।</i> ]</p>`;
    }

    if (bothChecked) {
      $(
        ".timeandmarks"
      ).innerHTML = `<span>সময়—৩ ঘন্টা</span><span>পূর্ণমান—${banglaNumbers[totalMarksInput]}</span>`; // Update time and marks for both CQ and MCQ

      id("answers").innerHTML = ""; // Clear previous answers

      const bothMcq = document.createElement("div"); // Create a div for MCQ section
      bothMcq.className = "bothMcq"; // Set class for styling
      const bothMcq2 = document.createElement("div"); //  Create a second div for MCQ section
      const bigBothHolder = document.createElement("div"); // Create a div to hold both MCQ sections
      bigBothHolder.className = "bigBothHolder"; // Set class for styling

      bothMcq.innerHTML = `<div><h3>ক বিভাগ : নৈর্ব্যক্তিক প্রশ্ন—${banglaNumbers[mcqMarks]}টি (প্রতিটি প্রশ্নের মান ১)</h3></div><div style="display:flex;justify-content:space-between"><div><span style="font-weight:bolder; font-size:11pt;">বহুনির্বাচনী প্রশ্ন : </span>(সঠিক উত্তরটি খাতায় লিখ)</div><div style="margin-right: 10px">১ × ${banglaNumbers[mcqMarks]} = ${banglaNumbers[mcqMarks]}</div></div>`; // Set header for MCQ section

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
        if (index < 12) {
          bothMcq.append(questionBlock);
        } else if (index >= 12 && index < 30) {
          bothMcq2.appendChild(questionBlock);
        }

        // Fill answer sheet
        const answerLi = document.createElement("li");
        answerLi.className = "answerList";
        answerLi.textContent = `${banglaNumbers[index + 1]} -- ${
          englishTobangla[shuffledMcq[index].correct_answer]
        },`;
        id("answers").appendChild(answerLi);
      });
      const bothHolder = document.createElement("div");
      bigBothHolder.append(bothMcq, bothHolder);
      id("answerSheet").style.display = "block";

      // entry cq
      selectedQuestions = shuffleArray(selectedQuestions);

      // const bothShort = document.createElement("div");
      // bothShort.className = "bothShort";

      const bothBroad = document.createElement("div");
      bothBroad.className = "bothBroad";

      let count2 = 1;
      let count4 = 1;
      for (let questionObj of selectedQuestions) {
        // if (questionObj.marks === 2) {
        //   if (count2 === 11) continue;
        //   bothShort.innerHTML += `<div class="final"><div class="interFinal"><span style="padding-right: 2px;">${
        //     banglaNumbers[count2++]
        //   }.</span><span>${
        //     questionObj.image ? `<img src="${questionObj.image}"><br>` : ""
        //   }${questionObj.question}</span></div><div></div></div>`;
        // }

        if (questionObj.marks === 7) {
          if (count4 === srijonshilCount) continue;
          bothBroad.innerHTML += `<div class="final" style="margin-top: 10px;"><div class="interFinal"><span style="padding-right: 2px;">${
            banglaNumbers[count4++]
          }.</span><span>${
            questionObj.image ? `<img src="${questionObj.image}"><br>` : ""
          }${questionObj.question}</span></div><div></div></div>`;
        }
      }

      // const markDistri3 = document.createElement("div");
      // markDistri3.className = "markDistri3";
      // markDistri3.innerHTML = `<h3 style="text-align:center;">খ বিভাগ : সংক্ষিপ্ত উত্তর প্রশ্ন</h3><div style="display:flex;justify-content:space-between;"><span style="font-weight:bolder; font-size:11pt;">নিচের প্রশ্নগুলোর উত্তর দাও :</span><span>২ × ১০ = ২০</span></div>`;
      // bothShort.prepend(markDistri3);

      const markDistri5 = document.createElement("div");
      markDistri5.className = "markDistri5";
      markDistri5.innerHTML = `<h3 style="text-align:center;">খ বিভাগ : রচনামূলক প্রশ্ন (প্রেক্ষাপটনির্ভর)</h3><div style="display:flex;justify-content:space-between;"><span style="font-weight:bolder; font-size:11pt;">যেকোনো ${
        banglaNumbers[srijonshilCount - 3]
      }টি প্রশ্নের উত্তর দাও :</span><span>${
        banglaNumbers[srijonshilCount - 3]
      } × ১০ = ${banglaNumbers[(srijonshilCount - 3) * 10]}</span></div>`;
      bothBroad.prepend(markDistri5);

      bothHolder.className = "bothHolder";
      // bothHolder.append(bothMcq2, bothShort);
      bothHolder.append(bothMcq2);

      questionPaper.append(bigBothHolder, bothBroad);
    }

    $(
      "#editable"
    ).innerText = `প্রশ্নটি এডিট করতে চাইলে প্রশ্নের উপর ক্লিক করুন। এডিট করা শেষে প্রিন্ট করতে প্রিন্ট বাটনে ক্লিক করুন। `;
    printBtn.style.display = "inline"; // Show print button
  } else {
    questionPaper.innerHTML = `<p style="color: red; font-size: 12px; text-align: center;">Couldn't match the exact total marks or some chapters don't have questions. Please try again with different total marks or fewer chapters.</p>`;
    id("answerSheet").style.display = "none";
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
  let chapterSelectionArea = $(".chapterSelectionArea");
  let footer = $("footer");
  footer.style.display = "none";
  chapterSelectionArea.style.display = "none";
  id("answerSheet").style.display = "none";
  $(".github").style.display = "none";
  id("questionSection").classList.add("changeQuesUI");
  setTimeout((e) => {
    window.print();
    setTimeout((e) => {
      id("questionSection").classList.remove("changeQuesUI");
      chapterSelectionArea.style.display = "block";
      footer.style.display = "block";
      $(".github").style.display = "block";
      if (id("cq").checked) {
        // id('answers').innerHTML = '';
        id("answerSheet").style.display = "none";
      }
      if (id("mcq").checked) {
        id("answerSheet").style.display = "block";
      }
    }, 1000);
  }, 50);
}

// download answers
id("downloadBtn").addEventListener("click", function () {
  // Get the content of the div and replace <li> with newline characters
  var content = id("answers").innerHTML;

  // Replace <li> tags with line breaks (newlines)
  content = content.replace(/<li\s*\/?>/gi, " "); // Optional bullet before each list item
  content = content.replace(/<\/li\s*\/?>/gi, "\n"); // Add a line break after each list item

  // Strip other HTML tags (optional)
  content = content.replace(/<\/?[^>]+(>|$)/g, "");

  // Create a Blob with the content
  var blob = new Blob([content], { type: "text/plain" });

  // Create a temporary link element
  var link = document.createElement("a");

  // Set the href of the link to a URL representing the Blob object
  link.href = URL.createObjectURL(blob);

  // Set the download attribute to specify the file name
  link.download = "mcq_answers.txt";

  // Append the link to the content div
  id("answers").appendChild(link);

  // Programmatically click the link to trigger the download
  link.click();

  // Optionally remove the link after the download
  id("answers").removeChild(link);
});

// reload the page if user leaves for 1 minute
let timer; // Variable to store the timer

// Attach the event listener to the visibilitychange event
document.addEventListener("visibilitychange", function () {
  if (document.hidden) {
    // If the tab is hidden, set a timer for 1 minute (60000 milliseconds)
    timer = setTimeout((e) => location.reload(), 60000);
  } else {
    // If the tab is visible again, clear the timer
    clearTimeout(timer);
  }
});

// index or marks convert to bangla
const banglaNumbers = [
  "০",
  "১",
  "২",
  "৩",
  "৪",
  "৫",
  "৬",
  "৭",
  "৮",
  "৯",
  "১০",
  "১১",
  "১২",
  "১৩",
  "১৪",
  "১৫",
  "১৬",
  "১৭",
  "১৮",
  "১৯",
  "২০",
  "২১",
  "২২",
  "২৩",
  "২৪",
  "২৫",
  "২৬",
  "২৭",
  "২৮",
  "২৯",
  "৩০",
  "৩১",
  "৩২",
  "৩৩",
  "৩৪",
  "৩৫",
  "৩৬",
  "৩৭",
  "৩৮",
  "৩৯",
  "৪০",
  "৪১",
  "৪২",
  "৪৩",
  "৪৪",
  "৪৫",
  "৪৬",
  "৪৭",
  "৪৮",
  "৪৯",
  "৫০",
  "৫১",
  "৫২",
  "৫৩",
  "৫৪",
  "৫৫",
  "৫৬",
  "৫৭",
  "৫৮",
  "৫৯",
  "৬০",
  "৬১",
  "৬২",
  "৬৩",
  "৬৪",
  "৬৫",
  "৬৬",
  "৬৭",
  "৬৮",
  "৬৯",
  "৭০",
  "৭১",
  "৭২",
  "৭৩",
  "৭৪",
  "৭৫",
  "৭৬",
  "৭৭",
  "৭৮",
  "৭৯",
  "৮০",
  "৮১",
  "৮২",
  "৮৩",
  "৮৪",
  "৮৫",
  "৮৬",
  "৮৭",
  "৮৮",
  "৮৯",
  "৯০",
  "৯১",
  "৯২",
  "৯৩",
  "৯৪",
  "৯৫",
  "৯৬",
  "৯৭",
  "৯৮",
  "৯৯",
  "১০০",
  "১০১",
  "১০২",
  "১০৩",
  "১০৪",
  "১০৫",
  "১০৬",
  "১০৭",
  "১০৮",
  "১০৯",
  "১১০",
  "১১১",
  "১১২",
  "১১৩",
  "১১৪",
  "১১৫",
  "১১৬",
  "১১৭",
  "১১৮",
  "১১৯",
  "১২০",
  "১২১",
  "১২২",
  "১২৩",
  "১২৪",
  "১২৫",
  "১২৬",
  "১২৭",
  "১২৮",
  "১২৯",
  "১৩০",
  "১৩১",
  "১৩২",
  "১৩৩",
  "১৩৪",
  "১৩৫",
  "১৩৬",
  "১৩৭",
  "১৩৮",
  "১৩৯",
  "১৪০",
  "১৪১",
  "১৪২",
  "১৪৩",
  "১৪৪",
  "১৪৫",
  "১৪৬",
  "১৪৭",
  "১৪৮",
  "১৪৯",
  "১৫০",
  "১৫১",
  "১৫২",
  "১৫৩",
  "১৫৪",
  "১৫৫",
  "১৫৬",
  "১৫৭",
  "১৫৮",
  "১৫৯",
  "১৬০",
  "১৬১",
  "১৬২",
  "১৬৩",
  "১৬৪",
  "১৬৫",
  "১৬৬",
  "১৬৭",
  "১৬৮",
  "১৬৯",
  "১৭০",
  "১৭১",
  "১৭২",
  "১৭৩",
  "১৭৪",
  "১৭৫",
  "১৭৬",
  "১৭৭",
  "১৭৮",
  "১৭৯",
  "১৮০",
  "১৮১",
  "১৮২",
  "১৮৩",
  "১৮৪",
  "১৮৫",
  "১৮৬",
  "১৮৭",
  "১৮৮",
  "১৮৯",
  "১৯০",
  "১৯১",
  "১৯২",
  "১৯৩",
  "১৯৪",
  "১৯৫",
  "১৯৬",
  "১৯৭",
  "১৯৮",
  "১৯৯",
  "২০০",
  "২০১",
  "২০২",
  "২০৩",
  "২০৪",
  "২০৫",
  "২০৬",
  "২০৭",
  "২০৮",
  "২০৯",
  "২১০",
  "২১১",
  "২১২",
  "২১৩",
  "২১৪",
  "২১৫",
  "২১৬",
  "২১৭",
  "২১৮",
  "২১৯",
  "২২০",
  "২২১",
  "২২২",
  "২২৩",
  "২২৪",
  "২২৫",
  "২২৬",
  "২২৭",
  "২২৮",
  "২২৯",
  "২৩০",
  "২৩১",
  "২৩২",
  "২৩৩",
  "২৩৪",
  "২৩৫",
  "২৩৬",
  "২৩৭",
  "২৩৮",
  "২৩৯",
  "২৪০",
  "২৪১",
  "২৪২",
  "২৪৩",
  "২৪৪",
  "২৪৫",
  "২৪৬",
  "২৪৭",
  "২৪৮",
  "২৪৯",
  "২৫০",
  "২৫১",
  "২৫২",
  "২৫৩",
  "২৫৪",
  "২৫৫",
  "২৫৬",
  "২৫৭",
  "২৫৮",
  "২৫৯",
  "২৬০",
  "২৬১",
  "২৬২",
  "২৬৩",
  "২৬৪",
  "২৬৫",
  "২৬৬",
  "২৬৭",
  "২৬৮",
  "২৬৯",
  "২৭০",
  "২৭১",
  "২৭২",
  "২৭৩",
  "২৭৪",
  "২৭৫",
  "২৭৬",
  "২৭৭",
  "২৭৮",
  "২৭৯",
  "২৮০",
  "২৮১",
  "২৮২",
  "২৮৩",
  "২৮৪",
  "২৮৫",
  "২৮৬",
  "২৮৭",
  "২৮৮",
  "২৮৯",
  "২৯০",
  "২৯১",
  "২৯২",
  "২৯৩",
  "২৯৪",
  "২৯৫",
  "২৯৬",
  "২৯৭",
  "২৯৮",
  "২৯৯",
  "৩০০",
  "৩০১",
  "৩০২",
  "৩০৩",
  "৩০৪",
  "৩০৫",
  "৩০৬",
  "৩০৭",
  "৩০৮",
  "৩০৯",
  "৩১০",
  "৩১১",
  "৩১২",
  "৩১৩",
  "৩১৪",
  "৩১৫",
  "৩১৬",
  "৩১৭",
  "৩১৮",
  "৩১৯",
  "৩২০",
  "৩২১",
  "৩২২",
  "৩২৩",
  "৩২৪",
  "৩২৫",
  "৩২৬",
  "৩২৭",
  "৩২৮",
  "৩২৯",
  "৩৩০",
  "৩৩১",
  "৩৩২",
  "৩৩৩",
  "৩৩৪",
  "৩৩৫",
  "৩৩৬",
  "৩৩৭",
  "৩৩৮",
  "৩৩৯",
  "৩৪০",
  "৩৪১",
  "৩৪২",
  "৩৪৩",
  "৩৪৪",
  "৩৪৫",
  "৩৪৬",
  "৩৪৭",
  "৩৪৮",
  "৩৪৯",
  "৩৫০",
  "৩৫১",
  "৩৫২",
  "৩৫৩",
  "৩৫৪",
  "৩৫৫",
  "৩৫৬",
  "৩৫৭",
  "৩৫৮",
  "৩৫৯",
  "৩৬০",
  "৩৬১",
  "৩৬২",
  "৩৬৩",
  "৩৬৪",
  "৩৬৫",
  "৩৬৬",
  "৩৬৭",
  "৩৬৮",
  "৩৬৯",
  "৩৭০",
  "৩৭১",
  "৩৭২",
  "৩৭৩",
  "৩৭৪",
  "৩৭৫",
  "৩৭৬",
  "৩৭৭",
  "৩৭৮",
  "৩৭৯",
  "৩৮০",
  "৩৮১",
  "৩৮২",
  "৩৮৩",
  "৩৮৪",
  "৩৮৫",
  "৩৮৬",
  "৩৮৭",
  "৩৮৮",
  "৩৮৯",
  "৩৯০",
  "৩৯১",
  "৩৯২",
  "৩৯৩",
  "৩৯৪",
  "৩৯৫",
  "৩৯৬",
  "৩৯৭",
  "৩৯৮",
  "৩৯৯",
  "৪০০",
  "৪০১",
  "৪০২",
  "৪০৩",
  "৪০৪",
  "৪০৫",
  "৪০৬",
  "৪০৭",
  "৪০৮",
  "৪০৯",
  "৪১০",
  "৪১১",
  "৪১২",
  "৪১৩",
  "৪১৪",
  "৪১৫",
  "৪১৬",
  "৪১৭",
  "৪১৮",
  "৪১৯",
  "৪২০",
  "৪২১",
  "৪২২",
  "৪২৩",
  "৪২৪",
  "৪২৫",
  "৪২৬",
  "৪২৭",
  "৪২৮",
  "৪২৯",
  "৪৩০",
  "৪৩১",
  "৪৩২",
  "৪৩৩",
  "৪৩৪",
  "৪৩৫",
  "৪৩৬",
  "৪৩৭",
  "৪৩৮",
  "৪৩৯",
  "৪৪০",
  "৪৪১",
  "৪৪২",
  "৪৪৩",
  "৪৪৪",
  "৪৪৫",
  "৪৪৬",
  "৪৪৭",
  "৪৪৮",
  "৪৪৯",
  "৪৫০",
  "৪৫১",
  "৪৫২",
  "৪৫৩",
  "৪৫৪",
  "৪৫৫",
  "৪৫৬",
  "৪৫৭",
  "৪৫৮",
  "৪৫৯",
  "৪৬০",
  "৪৬১",
  "৪৬২",
  "৪৬৩",
  "৪৬৪",
  "৪৬৫",
  "৪৬৬",
  "৪৬৭",
  "৪৬৮",
  "৪৬৯",
  "৪৭০",
  "৪৭১",
  "৪৭২",
  "৪৭৩",
  "৪৭৪",
  "৪৭৫",
  "৪৭৬",
  "৪৭৭",
  "৪৭৮",
  "৪৭৯",
  "৪৮০",
  "৪৮১",
  "৪৮২",
  "৪৮৩",
  "৪৮৪",
  "৪৮৫",
  "৪৮৬",
  "৪৮৭",
  "৪৮৮",
  "৪৮৯",
  "৪৯০",
  "৪৯১",
  "৪৯২",
  "৪৯৩",
  "৪৯৪",
  "৪৯৫",
  "৪৯৬",
  "৪৯৭",
  "৪৯৮",
  "৪৯৯",
  "৫০০",
];
const banglaSerial = {
  class6: "৬ষ্ঠ",
  class7: "৭ম",
  class8: "৮ম",
  class9: "৯ম",
  class10: "১০ম",
};
const englishTobangla = {
  A: "ক",
  B: "খ",
  C: "গ",
  D: "ঘ",
};

// window onload
window.onload = (e) => {
  document.querySelectorAll("footer > a")[1].style.opacity = "0.7"; // visitor show
  id("loading").style.display = "none";
};

$(".github-corner").addEventListener("click", (e) =>
  window.open("https://github.com/samrat9x/QuestionMaker", "_blank")
);

// Function to close the popup
id("close-popup").addEventListener("click", () => {
  popup.classList.remove("active"); // Remove the 'active' class to hide the popup
});

const editableElements = document.querySelectorAll('.editable');
const resumeContainer = document.getElementById('resume');
const downloadBtn = document.getElementById('downloadBtn');
function saveResumeData() {
    const data = {};
    editableElements.forEach(element => {
        const key = element.dataset.key || element.id || element.className.split(' ')[0];
        data[key] = element.innerHTML;
    });
    localStorage.setItem('resumeData', JSON.stringify(data));
}
function loadResumeData() {
    const savedData = localStorage.getItem('resumeData');
    if (savedData) {
        const data = JSON.parse(savedData);
        editableElements.forEach(element => {
            const key = element.dataset.key || element.id || element.className.split(' ')[0];
            if (data[key]) {
                element.innerHTML = data[key];
            }
        });
    }
}
editableElements.forEach(element => {
    element.addEventListener('input', saveResumeData);
});
document.addEventListener('DOMContentLoaded', loadResumeData);
function createRipple(event) {
    const button = event.currentTarget;

    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - (button.getBoundingClientRect().left + radius)}px`;
    circle.style.top = `${event.clientY - (button.getBoundingClientRect().top + radius)}px`;

    circle.classList.add('ripple-effect');

    const oldRipple = button.querySelector('.ripple-effect');
    if (oldRipple) {
        oldRipple.remove();
    }

    button.appendChild(circle);
}
downloadBtn.addEventListener('click', createRipple);
editableElements.forEach(element => {
    element.addEventListener('click', createRipple);
});

if (typeof window.html2canvas === 'undefined' || typeof window.jspdf === 'undefined') {
    console.error('Библиотеки html2canvas или jsPDF не загружены. Проверьте подключение в index.html.');
} else {
    downloadBtn.addEventListener('click', async () => {
        try {
            downloadBtn.style.display = 'none';

            const canvas = await window.html2canvas(resumeContainer, {
                scale: 2,
                useCORS: true
            });

            downloadBtn.style.display = 'block';

            const imgData = canvas.toDataURL('image/png');
            const pdf = new window.jspdf.jsPDF('p', 'mm', 'a4');

            const imgWidth = 210;
            const pageHeight = 297;
            const imgHeight = canvas.height * imgWidth / canvas.width;
            let heightLeft = imgHeight;

            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save('Резюме.pdf');

        } catch (error) {
            console.error('Ошибка при генерации PDF:', error);
            downloadBtn.style.display = 'block';
        }
    });
}
async function loadTheses() {
    try {
      const response = await fetch('/secretary/get-thesis');
      const data = await response.json();
  
      let theses = data.info;
  
      // Ensure theses is always an array
      if (!Array.isArray(theses)) {
        theses = theses ? [theses] : [];
      }
  
      console.log("Theses:", theses);
  
      const list = document.getElementById('thesisList');
      list.innerHTML = '';
  
      if (theses.length === 0) {
        list.innerHTML = '<li class="list-group-item">Δεν υπάρχουν διπλωματικές.</li>';
        return;
      }
  
      theses.forEach(thesis => {
        // Create list item with a button
        const li = document.createElement('li');
        li.classList.add('list-group-item');
  
        const btn = document.createElement('button');
        btn.classList.add('btn', 'btn-link', 'w-100', 'text-start');
        btn.textContent = thesis.title;
  
        // When clicked → fetch full thesis details
        btn.addEventListener('click', () => loadThesisDetails(thesis.id));
  
        li.appendChild(btn);
        list.appendChild(li);
      });
  
    } catch (err) {
      console.error('Error loading theses:', err);
    }
  }
  
  async function loadThesisDetails(id) {
    try {
      const response = await fetch(`/secretary/get-thesis/${id}`);
      if (!response.ok) throw new Error("Thesis not found");
      const thesis = await response.json();
  
      // Populate details card
      document.getElementById('detailsTitle').textContent = thesis.title || '—';
      document.getElementById('detailsDescription').textContent = thesis.description || 'Δεν υπάρχει περιγραφή';
      document.getElementById('detailsStatus').textContent = thesis.thesis_status || 'Άγνωστη';
      document.getElementById('detailsCommittee').textContent =
        `Επιβλέπων: ${thesis.supervisor_name || '—'}, ` +
        `Μέλος1: ${thesis.member1_name || '—'}, ` +
        `Μέλος2: ${thesis.member2_name || '—'}`;
  
      if (thesis.submission_date) {
        const assignedDate = new Date(thesis.submission_date);
        const diffDays = Math.floor((Date.now() - assignedDate) / (1000 * 60 * 60 * 24));
        document.getElementById('detailsElapsed').textContent = diffDays + " μέρες";
      } else {
        document.getElementById('detailsElapsed').textContent = 'Δεν έχει ανατεθεί';
      }
  
      document.getElementById('thesisDetails').classList.remove('d-none');
  
    } catch (err) {
      console.error("Error loading thesis details:", err);
    }
  }
  
  document.addEventListener('DOMContentLoaded', loadTheses);
  
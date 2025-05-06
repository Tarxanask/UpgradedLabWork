document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    $('[data-toggle="tooltip"]').tooltip();

    // Handle Mobile Sidebar
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const main = document.querySelector('main');

    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('show-sidebar');
            document.body.classList.toggle('sidebar-open');
        });

        // Close sidebar when clicking outside
        document.addEventListener('click', function(e) {
            if (window.innerWidth < 768 && 
                !sidebar.contains(e.target) && 
                !sidebarToggle.contains(e.target) && 
                sidebar.classList.contains('show-sidebar')) {
                sidebar.classList.remove('show-sidebar');
                document.body.classList.remove('sidebar-open');
            }
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Animate note items on hover
    const noteItems = document.querySelectorAll('.note-item');
    noteItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'translateX(5px)';
        });
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'translateX(0)';
        });
    });

    // Delete note with confirmation
    window.deleteNote = function(noteId) {
        if (confirm('Are you sure you want to delete this note?')) {
            const noteElement = document.querySelector(`[data-note-id="${noteId}"]`);
            
            if (noteElement) {
                // Start delete animation
                noteElement.style.opacity = '0';
                noteElement.style.transform = 'translateX(20px)';
                
                setTimeout(() => {
                    fetch("/delete-note", {
                        method: "POST",
                        body: JSON.stringify({ noteId: noteId }),
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }).then(response => {
                        if (response.ok) {
                            noteElement.remove();
                        }
                    }).catch(error => {
                        console.error('Error:', error);
                        alert('An error occurred while deleting the note');
                        // Restore the note if delete failed
                        noteElement.style.opacity = '1';
                        noteElement.style.transform = 'translateX(0)';
                    });
                }, 300);
            }
        }
    };

    // Add tag validation
    const tagForm = document.querySelector('form[action="/create-tag"]');
    if (tagForm) {
        tagForm.addEventListener('submit', function(e) {
            const tagInput = this.querySelector('#tag_name');
            if (tagInput.value.trim() === '') {
                e.preventDefault();
                alert('Please enter a tag name');
            }
        });
    }

    // Add note validation
    const noteForm = document.querySelector('form[action="/"]');
    if (noteForm) {
        noteForm.addEventListener('submit', function(e) {
            const noteInput = this.querySelector('#note');
            if (noteInput.value.trim() === '') {
                e.preventDefault();
                alert('Please enter a note');
            }
        });
    }

    // Auto-resize textarea
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });

        // Initialize height on page load
        if (textarea.value) {
            textarea.style.height = (textarea.scrollHeight) + 'px';
        }
    });

    // Flash message auto-dismiss
    setTimeout(function() {
        const alerts = document.querySelectorAll('.alert');
        alerts.forEach(alert => {
            if (alert) {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }
        });
    }, 5000);

    // Password validation for signup
    const password1Input = document.getElementById('password1');
    const password2Input = document.getElementById('password2');
    
    if (password1Input && password2Input) {
        const validatePasswords = () => {
            if (password1Input.value !== password2Input.value) {
                password2Input.setCustomValidity("Passwords don't match");
            } else {
                password2Input.setCustomValidity('');
            }
        };

        password1Input.addEventListener('change', validatePasswords);
        password2Input.addEventListener('change', validatePasswords);
    }

    // Form input animations
    document.querySelectorAll('.form-control').forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('input-focused');
        });

        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('input-focused');
            }
        });

        // Initialize state for inputs with values
        if (input.value) {
            input.parentElement.classList.add('input-focused');
        }
    });

    // Add loading state to forms
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function() {
            const submitBtn = this.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm mr-2"></span>Loading...';
            }
        });
    });

    // Smooth scroll and hover animations
    document.querySelectorAll('.note-item, .nav-link').forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(5px)';
        });
        element.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
        });
    });

    // Auto-dismiss alerts after 5 seconds
    setTimeout(function() {
        document.querySelectorAll('.alert').forEach(alert => {
            if (alert) {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }
        });
    }, 5000);

    // Initialize tooltips
    $('[data-toggle="tooltip"]').tooltip();

    // Animate notes on page load
    const animateNotes = () => {
        const notes = document.querySelectorAll('.note-item');
        notes.forEach((note, index) => {
            setTimeout(() => {
                note.style.opacity = '1';
                note.style.transform = 'translateY(0)';
            }, index * 100);
        });
    };

    // Run animation on page load
    setTimeout(animateNotes, 300);

    // Form validation and animation
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(e) {
            const submitBtn = this.querySelector('button[type="submit"]');
            if (!form.checkValidity()) {
                e.preventDefault();
                // Add shake animation to invalid fields
                form.querySelectorAll(':invalid').forEach(input => {
                    input.classList.add('shake');
                    setTimeout(() => input.classList.remove('shake'), 500);
                });
            } else if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm mr-2"></span>Loading...';
            }
        });
    });

    // Add hover effect to notes
    document.querySelectorAll('.note-item').forEach(note => {
        note.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(5px)';
            this.style.boxShadow = '2px 2px 8px rgba(0, 0, 0, 0.2)';
        });

        note.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
            this.style.boxShadow = 'none';
        });
    });

    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Remove floating label animations
    document.querySelectorAll('.form-control').forEach(input => {
        input.addEventListener('focus', function() {
            // Remove any floating label animations
            const wrapper = this.parentElement;
            if (wrapper.classList.contains('floating-label-wrapper')) {
                wrapper.classList.remove('floating-label-wrapper');
            }
        });
    });

    // Add keyframe animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
        }
        .shake {
            animation: shake 0.5s ease-in-out;
        }

        .floating-label-wrapper {
            position: relative;
        }
        .floating-label-wrapper label {
            position: absolute;
            left: 10px;
            top: 50%;
            transform: translateY(-50%);
            transition: all 0.3s ease;
            pointer-events: none;
            color: rgba(255, 255, 255, 0.5);
        }
        .floating-label-wrapper.focused label {
            top: 0;
            transform: translateY(-100%) scale(0.85);
            color: var(--accent-color);
        }
    `;
    document.head.appendChild(style);

    // Show related notes when clicking on a tag
    document.querySelectorAll('.tag-item').forEach(tag => {
        tag.addEventListener('click', (e) => {
            if (!e.target.closest('.tag-actions')) {  // Don't trigger if clicking edit/delete buttons
                const tagName = tag.querySelector('.tag-name').textContent;
                
                // Find all note sections
                document.querySelectorAll('.notes-section').forEach(section => {
                    const sectionTitle = section.querySelector('h3').textContent;
                    
                    if (sectionTitle.includes(tagName)) {
                        // Highlight matching section
                        section.style.transform = 'scale(1.02)';
                        section.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)';
                        section.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    } else {
                        // Dim other sections
                        section.style.opacity = '0.6';
                    }
                    
                    // Reset after animation
                    setTimeout(() => {
                        section.style.transform = '';
                        section.style.boxShadow = '';
                        section.style.opacity = '';
                    }, 2000);
                });
            }
        });
    });
});

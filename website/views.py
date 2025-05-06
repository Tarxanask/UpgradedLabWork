from flask import Blueprint, render_template, request, flash, jsonify, redirect
from flask_login import login_required, current_user
from .models import Note, Tag
from . import db
import json
import google.generativeai as genai
from nltk.stem import WordNetLemmatizer  # Add this import
import nltk
try:
    nltk.data.find('corpora/wordnet')
except LookupError:
    try:
        nltk.download('wordnet', quiet=True)
    except Exception:
        pass  # Handle case where download fails in deployment

genai.configure(api_key='AIzaSyCzO8JqOHfdcm8xcKecBA1NpIAj2FsA0V8')
model = genai.GenerativeModel('gemini-1.5-flash')

views = Blueprint('views', __name__)

def analyze_note(text):
    sentiment_prompt = f"Determine the sentiment of the following text. Return a single floating-point number between -1.0 and 1.0, where -1.0 is extremely negative, 0.0 is neutral, and 1.0 is extremely positive. Text: '{text}'"
    keyword_prompt = f"Extract 3-5 keywords or topics from the following text: '{text}'. Return them as a comma-separated list."
    try:
        sentiment_response = model.generate_content(sentiment_prompt)
        sentiment_score = float(sentiment_response.text)

        keyword_response = model.generate_content(keyword_prompt)
        keywords = [k.strip() for k in keyword_response.text.split(',')]

        return sentiment_score, keywords
    except Exception as e:
        print(f"Error analyzing note: {e}")
        return 0.0, []

icon_mapping = {
    'sports': 'fas fa-futbol',
    'fitness': 'fas fa-dumbbell',
    'health': 'fas fa-heartbeat',
    'injury': 'fas fa-band-aid',
    'food': 'fas fa-utensils',
    'cooking': 'fas fa-pepper-hot',
    'travel': 'fas fa-plane',
    'vacation': 'fas fa-umbrella-beach',
    'technology': 'fas fa-laptop-code',
    'science': 'fas fa-flask',
    'math': 'fas fa-square-root-alt',
    'education': 'fas fa-graduation-cap',
    'reading': 'fas fa-book',
    'history': 'fas fa-landmark',
    'politics': 'fas fa-balance-scale',
    'finance': 'fas fa-chart-line',
    'money': 'fas fa-dollar-sign',
    'work': 'fas fa-briefcase',
    'career': 'fas fa-user-tie',
    'productivity': 'fas fa-tasks',
    'art': 'fas fa-palette',
    'music': 'fas fa-music',
    'movies': 'fas fa-film',
    'gaming': 'fas fa-gamepad',
    'relationships': 'fas fa-heart',
    'family': 'fas fa-home',
    'friends': 'fas fa-users',
    'events': 'fas fa-calendar-alt',
    'nature': 'fas fa-tree',
    'environment': 'fas fa-globe-americas',
    'mental health': 'fas fa-brain',
    'journal': 'fas fa-pen',
    'ideas': 'fas fa-lightbulb',
    'coding': 'fas fa-code',
    'news': 'fas fa-newspaper',
    'spirituality': 'fas fa-pray',
    'dreams': 'fas fa-moon',
    'pets': 'fas fa-paw',
    'shopping': 'fas fa-shopping-cart',
    'weather': 'fas fa-cloud-sun',
    'default': 'fas fa-tag'  # Default icon for tags without a match
}

default_icon = 'fas fa-sticky-note'
lemmatizer = WordNetLemmatizer()

@views.route('/static-html')
def static_html():
    return """
    <h1>Welcome to the Note-Taking Website - Static HTML API</h1>
    <p>This is a static HTML API endpoint. It provides a fixed HTML response.</p>
    <h2>About this website</h2>
    <p>This website allows users to create, edit, and delete notes. 
    Notes can be organized using tags.</p>
    <p>This is a simple demonstration of a static API endpoint.</p>
    """

@views.route('/hello-notes')
@login_required
def hello_notes():
    name = request.args.get('name')
    if not name:
        name = current_user.first_name
    return f"<h2>Hello, {name}! This greeting is dynamically generated.</h2>"


@views.route('/', methods=['GET', 'POST'])
@login_required
def home():
    api_error = False
    if request.method == 'POST':
        note = request.form.get('note')
        tag_id = request.form.get('tag_id')

        if len(note) < 1:
            flash('Note is too short!', category='error')
        else:
            try:
                sentiment_score, keywords = analyze_note(note)
            except Exception as e:
                sentiment_score = 0
                keywords = []
                api_error = True

            new_note = Note(data=note, user_id=current_user.id, tag_id=tag_id, sentiment=sentiment_score)
            db.session.add(new_note)
            db.session.commit()
            flash('Note added!', category='success')

    tags = Tag.query.filter_by(user_id=current_user.id).all()
    notes = Note.query.filter_by(user_id=current_user.id).all()

    # Process existing notes
    for note in notes:
        try:
            sentiment, keywords = analyze_note(note.data)
            note.sentiment = sentiment
            note.icon = default_icon
            
            keyword_counts = {}
            for keyword in keywords:
                lemma = lemmatizer.lemmatize(keyword.lower())
                if lemma in icon_mapping:
                    if lemma not in keyword_counts:
                        keyword_counts[lemma] = 0
                    keyword_counts[lemma] += 1

            most_frequent_keyword = None
            max_count = 0
            for keyword, count in keyword_counts.items():
                if count > max_count:
                    most_frequent_keyword = keyword
                    max_count = count

            if most_frequent_keyword:
                note.icon = icon_mapping[most_frequent_keyword]
        except Exception as e:
            api_error = True
            continue

    return render_template("home.html", user=current_user, tags=tags, notes=notes, api_error=api_error)


@views.route('/delete-note', methods=['POST'])
def delete_note():  
    note = json.loads(request.data) # this function expects a JSON from the INDEX.js file 
    noteId = note['noteId']
    note = Note.query.get(noteId)
    if note:
        if note.user_id == current_user.id:
            db.session.delete(note)
            db.session.commit()

    return jsonify({})


@views.route('/edit-note/<int:note_id>', methods=['GET', 'POST'])
@login_required
def edit_note(note_id):
    note = Note.query.get_or_404(note_id)
    if note.user_id != current_user.id:
        flash('You do not have permission to edit this note.', category='error')
        return redirect('/')

    if request.method == 'POST':
        new_data = request.form.get('note')

        if len(new_data) < 1:
            flash('Note is too short!', category='error')
        else:
            note.data = new_data
            db.session.commit()
            flash('Note updated!', category='success')
            return redirect('/')

    return render_template("edit_note.html", user=current_user, note=note)


@views.route('/create-tag', methods=['POST'])
@login_required
def create_tag():
    name = request.form.get('tag_name')

    if len(name) < 1:
        flash('Tag name is too short!', category='error')
    else:
        # Determine the icon for the tag
        tag_icon = icon_mapping.get(name.lower(), icon_mapping['default'])
        new_tag = Tag(name=name, user_id=current_user.id, icon=tag_icon)
        db.session.add(new_tag)
        db.session.commit()
        flash('Tag added!', category='success')

    return redirect('/')


@views.route('/delete-tag/<int:tag_id>', methods=['POST'])
@login_required
def delete_tag(tag_id):
    tag = Tag.query.get(tag_id)
    if tag:
        if tag.user_id == current_user.id:
            # Delete all notes associated with the tag
            for note in tag.notes:
                db.session.delete(note)
            # Delete the tag
            db.session.delete(tag)
            db.session.commit()
            flash('Tag deleted!', category='success')
        else:
            flash('You do not have permission to delete this tag.', category='error')
    else:
        flash('Tag not found.', category='error')

    return redirect('/')


@views.route('/edit-tag/<int:tag_id>', methods=['GET', 'POST'])
@login_required
def edit_tag(tag_id):
    tag = Tag.query.get_or_404(tag_id)
    if tag.user_id != current_user.id:
        flash('You do not have permission to edit this tag.', category='error')
        return redirect('/')

    if request.method == 'POST':
        new_name = request.form.get('tag_name')

        if len(new_name) < 1:
            flash('Tag name is too short!', category='error')
        else:
            tag.name = new_name
            db.session.commit()
            flash('Tag updated!', category='success')
            return redirect('/')

    return render_template("edit_tag.html", user=current_user, tag=tag)

@views.route('/analyze-note', methods=['POST'])
def analyze_note_fallback(note_text):
    try:
        # Try using Gemini API
        genai.configure(api_key='AIzaSyCzO8JqOHfdcm8xcKecBA1NpIAj2FsA0V8')
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(f"Analyze the sentiment and extract keywords from this text: {note_text}")
        
        # Process response
        if response and response.text:
            return response.text, []
        
    except Exception as e:
        # Fallback to basic analysis if API fails
        words = note_text.lower().split()
        sentiment = 0
        
        # Basic sentiment analysis
        positive_words = {'good', 'great', 'awesome', 'excellent', 'happy', 'love'}
        negative_words = {'bad', 'terrible', 'awful', 'sad', 'hate', 'poor'}
        
        for word in words:
            if word in positive_words:
                sentiment += 1
            elif word in negative_words:
                sentiment -= 1
                
        # Extract simple keywords
        keywords = [word for word in words if len(word) > 4][:5]
        
        return sentiment, keywords

    return 0, []  # Neutral sentiment if all else fails

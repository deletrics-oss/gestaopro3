from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os

# Configuração
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///gestaopro.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
CORS(app, resources={r"/*": {"origins": ["http://localhost:9090", "http://72.60.246.250:9090", "https://72.60.246.250:9090"]}}) # Habilita CORS para o frontend na porta 9090

# --- Modelos de Dados (Entidades) ---

class CashMovement(db.Model):
    __tablename__ = 'cash_movements'
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(255), nullable=False)
    value = db.Column(db.Float, nullable=False)
    type = db.Column(db.String(50), nullable=False) # 'entrada' ou 'saida'
    date = db.Column(db.String(50), nullable=False)
    category = db.Column(db.String)
    reason = db.Column(db.String) # Campo 'Motivo' do frontend
    created_date = db.Column(db.DateTime, default=db.func.now())
    updated_date = db.Column(db.DateTime, default=db.func.now(), onupdate=db.func.now())

    def to_dict(self):
        data = {c.name: getattr(self, c.name) for c in self.__table__.columns}
        # Converter datetime para string para JSON
        if data.get('created_date'):
            data['created_date'] = data['created_date'].isoformat()
        if data.get('updated_date'):
            data['updated_date'] = data['updated_date'].isoformat()
        return data

class Product(db.Model):
    __tablename__ = 'products'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.String(255), nullable=True)
    cost = db.Column(db.Float, nullable=False)
    price = db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, nullable=False)
    created_date = db.Column(db.DateTime, default=db.func.now())
    updated_date = db.Column(db.DateTime, default=db.func.now(), onupdate=db.func.now())
    cost_details = db.Column(db.Text, nullable=True) 

    def to_dict(self):
        data = {c.name: getattr(self, c.name) for c in self.__table__.columns}
        # Converter datetime para string para JSON
        if data.get('created_date'):
            data['created_date'] = data['created_date'].isoformat()
        if data.get('updated_date'):
            data['updated_date'] = data['updated_date'].isoformat()
        return data

class Sale(db.Model):
    __tablename__ = 'sales'
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, nullable=False)
    product_name = db.Column(db.String(255), nullable=False)
    customer_name = db.Column(db.String(255), nullable=True)
    quantity = db.Column(db.Integer, nullable=False)
    sale_date = db.Column(db.String(50), nullable=False)
    total_revenue = db.Column(db.Float, nullable=False)
    total_cost = db.Column(db.Float, nullable=False)
    total_profit = db.Column(db.Float, nullable=False)
    created_date = db.Column(db.DateTime, default=db.func.now())
    updated_date = db.Column(db.DateTime, default=db.func.now(), onupdate=db.func.now())

    def to_dict(self):
        data = {c.name: getattr(self, c.name) for c in self.__table__.columns}
        # Converter datetime para string para JSON
        if data.get('created_date'):
            data['created_date'] = data['created_date'].isoformat()
        if data.get('updated_date'):
            data['updated_date'] = data['updated_date'].isoformat()
        return data

class MarketplaceOrder(db.Model):
    __tablename__ = 'marketplace_orders'
    id = db.Column(db.Integer, primary_key=True)
    order_data = db.Column(db.Text, nullable=False) 
    created_date = db.Column(db.DateTime, default=db.func.now())
    updated_date = db.Column(db.DateTime, default=db.func.now(), onupdate=db.func.now())

    def to_dict(self):
        data = {c.name: getattr(self, c.name) for c in self.__table__.columns}
        # Converter datetime para string para JSON
        if data.get('created_date'):
            data['created_date'] = data['created_date'].isoformat()
        if data.get('updated_date'):
            data['updated_date'] = data['updated_date'].isoformat()
        return data

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    created_date = db.Column(db.DateTime, default=db.func.now())
    updated_date = db.Column(db.DateTime, default=db.func.now(), onupdate=db.func.now())

    def to_dict(self):
        data = {c.name: getattr(self, c.name) for c in self.__table__.columns}
        # Converter datetime para string para JSON
        if data.get('created_date'):
            data['created_date'] = data['created_date'].isoformat()
        if data.get('updated_date'):
            data['updated_date'] = data['updated_date'].isoformat()
        return data

# --- Rotas da API (Simulando o bancoexterno) ---

@app.route('/bancoexterno/<entity>', methods=['GET'])
def get_entity(entity):
    if entity == 'cash_movements':
        data = CashMovement.query.all()
    elif entity == 'sales':
        data = Sale.query.all()
    elif entity == 'marketplace_orders':
        data = MarketplaceOrder.query.all()
    elif entity == 'users':
        data = User.query.all()
    elif entity == 'products':
        data = Product.query.all()
    else:
        return jsonify({'message': 'Entidade não encontrada'}), 404
    
    return jsonify([item.to_dict() for item in data])

@app.route('/bancoexterno/<entity>', methods=['POST'])
def create_entity(entity):
    data = request.json
    
    if entity == 'cash_movements':
        new_item = CashMovement(**data)
    elif entity == 'sales':
        new_item = Sale(**data)
    elif entity == 'marketplace_orders':
        new_item = MarketplaceOrder(order_data=data) 
    elif entity == 'users':
        # Antes de criar, verificar se é o usuário de teste e criar se não existir
        if data.get('username') == 'admin':
            existing_user = User.query.filter_by(username='admin').first()
            if existing_user:
                return jsonify(existing_user.to_dict()), 200 # Já existe, retorna sucesso
        
        new_item = User(**data)
    elif entity == 'products':
        new_item = Product(**data)
    else:
        return jsonify({'message': 'Entidade não encontrada'}), 404
    
    db.session.add(new_item)
    db.session.commit()
    return jsonify(new_item.to_dict()), 201

@app.route('/bancoexterno/<entity>/<int:id>', methods=['PUT'])
def update_entity(entity, id):
    data = request.json
    
    if entity == 'cash_movements':
        item = CashMovement.query.get_or_404(id)
    elif entity == 'sales':
        item = Sale.query.get_or_404(id)
    elif entity == 'marketplace_orders':
        item = MarketplaceOrder.query.get_or_404(id)
    elif entity == 'users':
        item = User.query.get_or_404(id)
    elif entity == 'products':
        item = Product.query.get_or_404(id)
    else:
        return jsonify({'message': 'Entidade não encontrada'}), 404
    
    for key, value in data.items():
        setattr(item, key, value)
        
    db.session.commit()
    return jsonify(item.to_dict())

@app.route('/bancoexterno/<entity>/<int:id>', methods=['DELETE'])
def delete_entity(entity, id):
    if entity == 'cash_movements':
        item = CashMovement.query.get_or_404(id)
    elif entity == 'sales':
        item = Sale.query.get_or_404(id)
    elif entity == 'marketplace_orders':
        item = MarketplaceOrder.query.get_or_404(id)
    elif entity == 'users':
        item = User.query.get_or_404(id)
    elif entity == 'products':
        item = Product.query.get_or_404(id)
    else:
        return jsonify({'message': 'Entidade não encontrada'}), 404
    
    db.session.delete(item)
    db.session.commit()
    return '', 204

# --- Rotas Específicas ---

@app.route('/bancoexterno/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password_hash = data.get('password_hash')
    
    user = User.query.filter_by(username=username).first()
    
    # Simulação de verificação de senha
    if user and user.password_hash == password_hash:
        return jsonify({'message': 'Login bem-sucedido', 'user': user.to_dict()}), 200
    else:
        return jsonify({'message': 'Usuário ou senha inválidos'}), 401

@app.route('/bancoexterno/upload_audio', methods=['POST'])
def upload_audio():
    if 'audio' not in request.files:
        return jsonify({'message': 'Nenhum arquivo de áudio enviado'}), 400
    
    audio_file = request.files['audio']
    if audio_file.filename == '':
        return jsonify({'message': 'Nenhum arquivo selecionado'}), 400
    
    upload_folder = os.path.join(os.getcwd(), 'uploads')
    os.makedirs(upload_folder, exist_ok=True)
    
    filename = secure_filename(audio_file.filename)
    filepath = os.path.join(upload_folder, filename)
    audio_file.save(filepath)
    
    # Retorna a URL completa para o frontend
    return jsonify({'url': f'http://localhost:8089/uploads/{filename}'}), 201

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    upload_folder = os.path.join(os.getcwd(), 'uploads')
    return send_from_directory(upload_folder, filename)

# --- Inicialização ---

if __name__ == '__main__':
    with app.app_context():
        db.create_all() # Cria as tabelas se não existirem
        
        # Cria o usuário 'admin' se não existir para o teste
        admin_user = User.query.filter_by(username='admin').first()
        if not admin_user:
            db.session.add(User(username='admin', password_hash='suporte@1'))
            db.session.commit()
            
        # Cria o usuário de teste alternativo
        admin1_user = User.query.filter_by(username='admin1').first()
        if not admin1_user:
            db.session.add(User(username='admin1', password_hash='suporte@1'))
            db.session.commit()
    
    app.run(host='0.0.0.0', port=8089)

from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
import os

# Configuração
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///gestaopro.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# --- Modelos de Dados (Entidades) ---

class CashMovement(db.Model):
    __tablename__ = 'cash_movements'
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(255), nullable=False)
    value = db.Column(db.Float, nullable=False)
    type = db.Column(db.String(50), nullable=False) # 'entrada' ou 'saida'
    date = db.Column(db.String(50), nullable=False)
    category = db.Column(db.String)
    reason = db.Column(db.String) # Campo 'Motivo' do frontend100), nullable=True)
    # Adicionar outros campos se necessário (ex: user_id, category)

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

class Product(db.Model):
    __tablename__ = 'products'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.String(255), nullable=True)
    cost = db.Column(db.Float, nullable=False)
    price = db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, nullable=False)
    # Novo campo para armazenar os detalhes de custo como JSON (string)
    cost_details = db.Column(db.Text, nullable=True) 
    # Adicionar outros campos se necessário (ex: category, supplier)

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

class MarketplaceOrder(db.Model):
    __tablename__ = 'marketplace_orders'
    id = db.Column(db.Integer, primary_key=True)
    order_data = db.Column(db.Text, nullable=False) # Armazenar JSON como texto
    # Adicionar outros campos se necessário

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    # Adicionar outros campos se necessário

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

# --- Rotas da API (Simulando o bancoexterno) ---

@app.route('/bancoexterno/<entity>', methods=['GET'])
def get_entity(entity):
    if entity == 'cash_movements':
        data = CashMovement.query.all()
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
    elif entity == 'marketplace_orders':
        new_item = MarketplaceOrder(order_data=data) # Adapte conforme a estrutura real
    elif entity == 'users':
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
    if entity == 'cash_movements':
        item = CashMovement.query.get_or_404(id)
    elif entity == 'marketplace_orders':
        item = MarketplaceOrder.query.get_or_404(id)
    elif entity == 'users':
        item = User.query.get_or_404(id)
    elif entity == 'products':
        item = Product.query.get_or_404(id)
    else:
        return jsonify({'message': 'Entidade não encontrada'}), 404
    
    data = request.json
    for key, value in data.items():
        setattr(item, key, value)
        
    db.session.commit()
    return jsonify(item.to_dict())

@app.route('/bancoexterno/<entity>/<int:id>', methods=['DELETE'])
def delete_entity(entity, id):
    if entity == 'cash_movements':
        item = CashMovement.query.get_or_404(id)
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

# --- Rotas de Áudio e Backup (Simulando o servidor externo) ---

@app.route('/audios/<filename>', methods=['GET'])
def get_audio(filename):
    # Apenas simula a URL, o frontend deve lidar com o áudio
    return jsonify({'url': f'/static/audios/{filename}'}) # Assumindo que os áudios serão colocados em static/audios

@app.route('/bancoexterno/backups/<timestamp>', methods=['POST'])
def create_backup(timestamp):
    # Apenas simula o recebimento do backup
    print(f"Backup recebido para {timestamp}: {request.json}")
    return jsonify({'message': 'Backup recebido com sucesso'}), 201

# --- Inicialização ---

if __name__ == '__main__':
    with app.app_context():
        db.create_all() # Cria as tabelas se não existirem
    
    # Adicionar cabeçalhos CORS para permitir comunicação com o frontend Vite
    from flask_cors import CORS
    CORS(app)
    
    app.run(host='0.0.0.0', port=8089)

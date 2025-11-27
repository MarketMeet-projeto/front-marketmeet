/**
 * ROTA CORRIGIDA PARA CRIAR USUÁRIOS
 * Cole este código no seu backend (server.ts ou arquivo de rotas)
 * 
 * Melhorias implementadas:
 * 1. Logs detalhados em cada etapa
 * 2. Validação robusta com mensagens de erro claras
 * 3. Tratamento completo de exceções
 * 4. Suporte para campos opcionais sem quebrar a funcionalidade
 */

const express = require('express');
const bcrypt = require('bcrypt');

// Supondo que 'query' é sua função de conexão com o banco
// const { query } = require('./database');

app.post('/api/users/create', checkDB, async (req, res) => {
  try {
    console.log('🔵 [CREATE USER] - Requisição recebida');
    console.log('🔵 Body:', req.body);

    const {
      full_name,
      username,
      birth_date,
      phone,
      email,
      password,
      profile_photo,
      cnpj,
      user_type
    } = req.body;

    // ============================================
    // 1. VALIDAR CAMPOS OBRIGATÓRIOS
    // ============================================
    console.log('🟡 [VALIDATE] - Validando campos obrigatórios...');
    
    if (!username || username.trim() === '') {
      console.log('❌ Username vazio');
      return res.status(400).json({ error: 'Username é obrigatório' });
    }

    if (!email || email.trim() === '') {
      console.log('❌ Email vazio');
      return res.status(400).json({ error: 'Email é obrigatório' });
    }

    if (!password || password.trim() === '') {
      console.log('❌ Password vazio');
      return res.status(400).json({ error: 'Senha é obrigatória' });
    }

    if (!birth_date || birth_date.trim() === '') {
      console.log('❌ Birth_date vazio');
      return res.status(400).json({ error: 'Data de nascimento é obrigatória' });
    }

    console.log('✅ Campos obrigatórios OK');

    // ============================================
    // 2. VALIDAR FORMATO DA DATA
    // ============================================
    console.log('🟡 [DATE VALIDATE] - Validando formato de data...');
    
    const dataRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = birth_date.match(dataRegex);

    if (!match) {
      console.log('❌ Formato de data inválido:', birth_date);
      return res.status(400).json({
        error: 'Formato de data inválido. Use DD/MM/YYYY'
      });
    }

    const [, dia, mes, ano] = match;
    
    // Validar mês e dia
    const diaNum = parseInt(dia);
    const mesNum = parseInt(mes);
    
    if (mesNum < 1 || mesNum > 12) {
      console.log('❌ Mês inválido:', mesNum);
      return res.status(400).json({ error: 'Mês inválido. Use 01-12' });
    }

    if (diaNum < 1 || diaNum > 31) {
      console.log('❌ Dia inválido:', diaNum);
      return res.status(400).json({ error: 'Dia inválido. Use 01-31' });
    }

    const dataBanco = `${ano}-${mes}-${dia}`;
    const dataObj = new Date(dataBanco);

    if (isNaN(dataObj.getTime())) {
      console.log('❌ Data inválida após parse:', dataBanco);
      return res.status(400).json({ error: 'Data inválida' });
    }

    console.log('✅ Data validada:', dataBanco);

    // ============================================
    // 3. VALIDAR EMAIL
    // ============================================
    console.log('🟡 [EMAIL VALIDATE] - Validando email...');
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Email inválido:', email);
      return res.status(400).json({ error: 'Email inválido' });
    }

    console.log('✅ Email validado');

    // ============================================
    // 4. VALIDAR USERNAME (mínimo 3 caracteres)
    // ============================================
    console.log('🟡 [USERNAME VALIDATE] - Validando username...');
    
    if (username.length < 3) {
      console.log('❌ Username muito curto:', username);
      return res.status(400).json({ error: 'Username deve ter pelo menos 3 caracteres' });
    }

    console.log('✅ Username validado');

    // ============================================
    // 5. VALIDAR PASSWORD
    // ============================================
    console.log('🟡 [PASSWORD VALIDATE] - Validando password...');
    
    if (password.length < 6) {
      console.log('❌ Password muito curta');
      return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' });
    }

    console.log('✅ Password validada');

    // ============================================
    // 6. PREPARAR VALORES COM DEFAULTS
    // ============================================
    console.log('🟡 [PREPARE DATA] - Preparando valores...');
    
    const userTypeValue = user_type || 'is_standard';
    const profilePhotoValue = profile_photo || null;
    const phoneValue = phone || null;
    const cnpjValue = cnpj || null;
    const fullNameValue = full_name || null;

    console.log('✅ Valores preparados:', {
      full_name: fullNameValue,
      username,
      birth_date: dataBanco,
      email,
      user_type: userTypeValue,
      phone: phoneValue,
      cnpj: cnpjValue
    });

    // ============================================
    // 7. CRIPTOGRAFAR SENHA
    // ============================================
    console.log('🟡 [HASH PASSWORD] - Criptografando senha...');
    
    let senhaHash;
    try {
      senhaHash = await bcrypt.hash(password, 10);
      console.log('✅ Senha criptografada');
    } catch (hashError) {
      console.error('❌ Erro ao criptografar senha:', hashError);
      return res.status(500).json({ error: 'Erro ao processar senha' });
    }

    // ============================================
    // 8. INSERIR NO BANCO
    // ============================================
    console.log('🟡 [DB INSERT] - Inserindo usuário no banco...');
    
    const insertQuery = `
      INSERT INTO account (
        full_name, username, birth_date, phone, email, password, profile_photo, cnpj, user_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    try {
      const result = await query(insertQuery, [
        fullNameValue,
        username,
        dataBanco,
        phoneValue,
        email,
        senhaHash,
        profilePhotoValue,
        cnpjValue,
        userTypeValue
      ]);

      console.log('✅ Usuário inserido com sucesso! ID:', result.insertId);

      res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso!',
        userId: result.insertId
      });

    } catch (dbError) {
      console.error('❌ Erro ao inserir no banco:', dbError);
      console.error('Código de erro:', dbError.code);
      console.error('SQL:', dbError.sql);

      // Verificar se é erro de chave duplicada
      if (dbError.code === 'ER_DUP_ENTRY') {
        if (dbError.message.includes('email')) {
          return res.status(400).json({ error: 'Este email já está em uso' });
        } else if (dbError.message.includes('username')) {
          return res.status(400).json({ error: 'Este username já está em uso' });
        } else {
          return res.status(400).json({ error: 'Dados duplicados: ' + dbError.message });
        }
      }

      // Outros erros do banco
      return res.status(500).json({ 
        error: 'Erro ao criar usuário no banco de dados',
        details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
      });
    }

  } catch (error) {
    console.error('❌ [FATAL ERROR] - Erro não capturado:', error);
    console.error('Stack:', error.stack);

    res.status(500).json({
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * COMPARAÇÃO - O que foi mudado:
 * 
 * ANTES:
 * - Validações genéricas
 * - Logs insuficientes
 * - Tratamento de erro vago
 * 
 * DEPOIS:
 * - Validação passo-a-passo com logs coloridos
 * - Mensagens de erro específicas para cada caso
 * - Logs em cada etapa para debug fácil
 * - Melhor tratamento de exceções
 * - Separação clara entre erros do usuário (400) e erros do servidor (500)
 */
